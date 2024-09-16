import { Declaration, Identifier, isCallExpression, isIdentifierExpression, travel } from "nn-language";
import { Result, Ok, Err } from "ts-features";

import { DeclarationScope, FileScope, Size, Value, ResolveError } from "./types";
	
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
 
export function resolveNames(sourceCode: Declaration[], path: string): Result<FileScope, ResolveError[]> {
  const fileScope: FileScope = {
    path,
    declarations: {}
  };

  const errors: ResolveError[] = [];

  sourceCode.forEach(decl => {
    const declScope: DeclarationScope = {
      file: fileScope,
      declaration: decl.name.value,
      sizes: {},
      values: {}
    }

    decl.sizeDeclList && decl.sizeDeclList.decls
      .forEach(size => {
        declScope.sizes[size.value] = toSize(declScope, size);
      });

    decl.argumentList.args
      .forEach(arg => {
        declScope.values[arg.ident.value] = toValue(declScope, arg.ident);
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
      })

    const callExpressions = travel(decl.exprs, isCallExpression);
    const identExprs = travel(decl.exprs, isIdentifierExpression);

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

    fileScope.declarations[decl.name.value] = declScope;
  });

  if (errors.length > 0) {
    return Err(errors);
  }

  return Ok(fileScope);
}

export * from './types'
