import { Declaration, Identifier, isCallExpression, isIdentifierExpression, travel } from "nn-language";
import { Result, Ok, Err } from "ts-features";

import { DeclarationScope, FileScope, Size, Value, ResolveError } from "./types";
	
export function findSize(scope: DeclarationScope, ident: string): Size {
  return scope.sizes.find(size => size.ident === ident);
}

export function findValue(scope: DeclarationScope, ident: string): Value {
  return scope.values.find(value => value.ident === ident);
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
    declarations: []
  };

  const errors: ResolveError[] = [];

  for (const decl of sourceCode) {
    const declScope: DeclarationScope = {
      file: fileScope,
      declaration: decl.name.value,
      sizes: [],
      values: []
    }

    decl.sizeDeclList.decls
      .forEach(ident => {
        const sizeScope = toSize(declScope, ident);
        declScope.sizes.push(sizeScope);
      });

    decl.argumentList.args
      .forEach(arg => {
        const valueScope = toValue(declScope, arg.ident);
        declScope.values.push(valueScope);
      });

    decl.argumentList.args
      .forEach(arg => {
        arg.valueType.sizes.forEach(size => {
          if (typeof size === "number") {
            return;
          }

          const sizeScope = findSize(declScope, size.value);

          if (sizeScope) {
            sizeScope.nodes.add(size);
          } else {
            declScope.sizes.push(toSize(declScope, size));
          }
        })
      })

    const callExpressions = travel(decl.exprs, isCallExpression);
    const identExprs = travel(decl.exprs, isIdentifierExpression);

    identExprs
      .forEach(identExpr => {
        const value = findValue(declScope, identExpr.ident.value);

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
      .filter(ident => typeof ident !== "number")
      .forEach(ident => {
        const size = findSize(declScope, ident.value);

        if (size) {
          size.nodes.add(ident);
        } else {
          errors.push({
            message: `Using undeclared size name '${ident.value}'.`,
            node: ident
          });
        }
      });

    fileScope.declarations.push(declScope);
  }

  if (errors.length > 0) {
    return Err(errors);
  }

  return Ok(fileScope);
}

export * from './types'
