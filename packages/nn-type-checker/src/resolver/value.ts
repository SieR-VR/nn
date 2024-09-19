import { type Node, type Identifier, type Declaration, isIdentifierExpression, travel } from "nn-language";
import { DeclarationScope, FileScope, ResolveError } from "./types";

export interface Value {
  scope: DeclarationScope;
  ident: string;

  nodes: Set<Node>;
}

export function findValue(scope: DeclarationScope, ident: Identifier): Value | undefined {
  return scope.values[ident.value];
}

export function toValue(scope: DeclarationScope, ident: Identifier): Value {
  return {
    scope,
    ident: ident.value,

    nodes: new Set([ident])
  };
}

export function resolveValues(scope: DeclarationScope): ResolveError[] {
  const errors: ResolveError[] = [];

  scope.node.argumentList.args
    .forEach(arg => {
      scope.values[arg.ident.value] = toValue(scope, arg.ident);
    });

  travel(scope.node.exprs, isIdentifierExpression)
    .forEach(identExpr => {
      const value = findValue(scope, identExpr.ident);

      if (value) {
        value.nodes.add(identExpr.ident);
      } else {
        errors.push({
          message: `Using undeclared value name '${identExpr.ident.value}'.`,
          node: identExpr.ident
        });
      }
    });

  return errors;
}