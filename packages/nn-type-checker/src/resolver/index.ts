import { Declaration, Identifier, isCallExpression, isIdentifierExpression, travel } from "nn-language";
import { DeclarationScope, FileScope, Size, Value } from "./types";
	
function findSize(scope: DeclarationScope, ident: string): Size {
  return scope.sizes.find(size => size.ident === ident);
}

function findValue(scope: DeclarationScope, ident: string): Value {
  return scope.values.find(value => value.ident === ident);
}

function toSize(scope: DeclarationScope, ident: Identifier): Size {
  return {
    scope,
    ident: ident.value,

    nodes: new Set([ident])
  };
}

function toValue(scope: DeclarationScope, ident: Identifier): Value {
  return {
    scope,
    ident: ident.value,

    nodes: new Set([ident])
  };
}
 
export function resolveNames(sourceCode: Declaration[], path: string): FileScope {
  const fileScope: FileScope = {
    path,
    declarations: []
  };

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

    const callExpressions = travel(decl.exprs, isCallExpression);
    const identExprs = travel(decl.exprs, isIdentifierExpression);

    identExprs
      .forEach(identExpr => {
        const value = findValue(declScope, identExpr.ident.value);

        if (value) {
          value.nodes.add(identExpr.ident);
        } else {
          const newValue = toValue(declScope, identExpr.ident);
          declScope.values.push(newValue);
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
          const newSize = toSize(declScope, ident);
          declScope.sizes.push(newSize);
        }
      });

    fileScope.declarations.push(declScope);
  }

  return fileScope;
}
