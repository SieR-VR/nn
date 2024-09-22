import { None, Option, Some } from "ts-features";
import { Expression, Identifier, isCallExpression, Node, travel } from "nn-language";

import { DeclarationScope, FileScope } from "./scope";
import { Diagnostic, findSize, Size, toSize, toValue, Value } from "..";

export interface Flow {
  calls: Set<Flow>;
  declaration: string;

  sizes: Size[];
  args: Value[];
  return?: Expression | Identifier;
}

export function resolveFlows(scope: FileScope): Diagnostic[] {
  const errors: Diagnostic[] = [];

  const resolveFlow = (declScope: DeclarationScope) => {
    const flow = scope.flows[declScope.declaration];

    flow.sizes = declScope.node.sizeDeclList?.decls.map(decl => findSize(declScope, decl)!) ?? [];
    flow.args = declScope.node.argumentList.args.map(arg => declScope.values[arg.ident.value]);
    flow.return = declScope.node.exprs.at(-1);
  }

  const resolveFlowCall = (declScope: DeclarationScope) =>
    travel(declScope.node, isCallExpression)
      .forEach(callExpression => {
        if (callExpression.callee.value === declScope.declaration) {
          errors.push({
            message: `Recursive call to '${declScope.declaration}'.`,
            node: callExpression.callee
          });
        } else if (callExpression.callee.value in scope.flows) {
          const callFlow = scope.flows[callExpression.callee.value];
          declScope.flow.calls.add(callFlow);
        } else {
          errors.push({
            message: `Using undeclared flow name '${callExpression.callee.value}'.`,
            node: callExpression.callee
          });
        }
      });

  Object.values(scope.declarations)
    .forEach(resolveFlow);
  
  Object.values(scope.declarations)
    .forEach(resolveFlowCall);

  return errors;
}

export function findCircularFlow(flow: Flow): Option<Flow[]>  {
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
