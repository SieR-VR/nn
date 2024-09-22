import { Node, Identifier, travel, isSizeNode } from "nn-language";
import { DeclarationScope } from "./scope";

import { Diagnostic } from "..";

export interface Size {
  scope: DeclarationScope;
  ident: string;

  nodes: Set<Node>;
  first: Node;
}

export function findSize(scope: DeclarationScope, ident: Identifier): Size | undefined {
  return scope.sizes[ident.value];
}

export function toSize(scope: DeclarationScope, ident: Identifier): Size {
  return {
    scope,
    ident: ident.value,

    nodes: new Set([ident]),
    first: ident,
  };
}

export function resolveSizes(scope: DeclarationScope): Diagnostic[] {
  const errors: Diagnostic[] = [];

  scope.node.sizeDeclList && scope.node.sizeDeclList.decls
    .forEach(size => {
      scope.sizes[size.value] = toSize(scope, size);
    });

  travel(scope.node.argumentList, isSizeNode)
    .filter(size => size.sizeType === "ident")
    .forEach(size => {
      const ident = size.ident!;
      const sizeScope = findSize(scope, ident);

      if (sizeScope) {
        sizeScope.nodes.add(size);
      } else {
        scope.sizes[ident.value] = toSize(scope, ident);
      }
    });

  travel(scope.node.exprs, isSizeNode)
    .filter(ident => ident.sizeType === "ident")
    .forEach(size => {
      const ident = size.ident!;
      const sizeScope = findSize(scope, ident);

      if (sizeScope) {
        sizeScope.nodes.add(ident);
      } else {
        errors.push({
          message: `Using undeclared size name '${ident.value}'.`,
          node: ident
        });
      }
    });

  return errors;
}
