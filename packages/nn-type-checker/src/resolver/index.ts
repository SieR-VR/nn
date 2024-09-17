import { Declaration, Identifier, isCallExpression, isIdentifierExpression, travel } from "nn-language";
import { Result, Ok, Err, Option, Some, None } from "ts-features";

import { DeclarationScope, FileScope, Size, Value, ResolveError, Flow } from "./types";

const defaultFlows: Record<string, Flow> = {
  "Trainable": { calls: new Set(), declaration: "Trainable" },
  "MatMul": { calls: new Set(), declaration: "MatMul" },
  "Bias": { calls: new Set(), declaration: "Bias" }
}

export function findSize(scope: DeclarationScope, ident: Identifier): Size | undefined {
  return scope.sizes[ident.value];
}

export function findValue(scope: DeclarationScope, ident: Identifier): Value | undefined {
  return scope.values[ident.value];
}

export function toSize(scope: DeclarationScope, ident: Identifier): Size {
  return {
    scope,
    ident: ident.value,

    nodes: new Set([ident])
  };
}

export function toValue(scope: DeclarationScope, ident: Identifier): Value {
  return {
    scope,
    ident: ident.value,

    nodes: new Set([ident])
  };
}

function findCircularFlow(flow: Flow): Option<Flow[]>  {
  const flows: Flow[] = [];

  const visit = (flow: Flow): boolean => {
    if (flows.includes(flow)) {
      return true;
    }

    flows.push(flow);

    for (const callFlow of flow.calls) {
      if (visit(callFlow)) {
        return true;
      }
    }

    flows.pop();

    return false;
  }

  if (visit(flow)) {
    return Some(flows);
  }

  return None();
}

export function resolveNames(sourceCode: Declaration[], path: string): Result<FileScope, ResolveError[]> {
  const fileScope: FileScope = {
    path,
    declarations: {},
    flows: defaultFlows
  };

  const errors: ResolveError[] = [];
  const names = sourceCode.map(decl => decl.name.value);

  // Initialize file scopes pass
  sourceCode.forEach(decl => {
    const declScope: DeclarationScope = {
      file: fileScope,
      declaration: decl.name.value,

      node: decl,
      flow: { calls: new Set(), declaration: decl.name.value },
      sizes: {},
      values: {}
    }

    if (names.filter(name => name === decl.name.value).length > 1) {
      errors.push({
        message: `Duplicate function name '${decl.name.value}'.`,
        node: decl.name
      });

      return;
    }

    fileScope.declarations[decl.name.value] = declScope;
    fileScope.flows[decl.name.value] = declScope.flow;
  });

  // Resolve value names pass
  sourceCode.forEach(decl => {
    const declScope = fileScope.declarations[decl.name.value];
    const identExprs = travel(decl.exprs, isIdentifierExpression);

    decl.argumentList.args
      .forEach(arg => {
        declScope.values[arg.ident.value] = toValue(declScope, arg.ident);
      });

    identExprs
      .forEach(identExpr => {
        const value = findValue(declScope, identExpr.ident);

        if (value) {
          value.nodes.add(identExpr.ident);
        } else {
          errors.push({
            message: `Using undeclared name '${identExpr.ident.value}'.`,
            node: identExpr
          });
        }
      });

    fileScope.declarations[decl.name.value] = declScope;
  });

  // Resolve size names pass
  sourceCode.forEach(decl => {
    const declScope = fileScope.declarations[decl.name.value];
    const callExpressions = travel(decl.exprs, isCallExpression);

    decl.sizeDeclList && decl.sizeDeclList.decls
      .forEach(size => {
        declScope.sizes[size.value] = toSize(declScope, size);
      });

    decl.argumentList.args
      .flatMap(arg => arg.valueType.sizes)
      .filter(size => !!size)
      .forEach(size => {
        if (!size || typeof size === "number") {
          return;
        }

        const sizeScope = findSize(declScope, size);

        if (sizeScope) {
          sizeScope.nodes.add(size);
        } else {
          declScope.sizes[size.value] = toSize(declScope, size);
        }
      });


    callExpressions
      .flatMap(sizeDeclList => sizeDeclList.sizes)
      .filter(ident => !!ident)
      .filter(ident => typeof ident !== "number" && typeof ident !== "undefined")
      .forEach(ident => {
        const size = findSize(declScope, ident);

        if (size) {
          size.nodes.add(ident);
        } else {
          errors.push({
            message: `Using undeclared size name '${ident.value}'.`,
            node: ident
          });
        }
      });
  });

  // Resolve flows pass
  sourceCode.forEach(decl => {
    const declFlow = fileScope.flows[decl.name.value];
    const callExpressions = travel(decl.exprs, isCallExpression);

    callExpressions
      .forEach(callExpression => {
        if (callExpression.callee.value === decl.name.value) {
          errors.push({
            message: `Recursive call to '${decl.name.value}'.`,
            node: callExpression.callee
          });
        } else if (callExpression.callee.value in fileScope.flows) {
          const callFlow = fileScope.flows[callExpression.callee.value];
          declFlow.calls.add(callFlow);
        } else if (!names.includes(callExpression.callee.value)) {
          errors.push({
            message: `Using undeclared flow name '${callExpression.callee.value}'.`,
            node: callExpression.callee
          });
        }
      });
  })

  // Check for circular flows
  for (const flowName in fileScope.flows) {
    const flow = fileScope.flows[flowName];
    const result = findCircularFlow(flow);

    if (result.is_some()) {
      const flows = result.unwrap();

      errors.push({
        message: `Circular flow detected from '${flows.map(flow => flow.declaration).join(', ')}'.`,
        node: fileScope.declarations[flows[0].declaration].node
      });
    }
  }

  if (errors.length > 0) {
    return Err(errors);
  }

  return Ok(fileScope);
}

export * from './types'
