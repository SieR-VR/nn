import { None, Option, Some } from "ts-features";
import { Node, Identifier, travel, isSizeNode } from "nn-language";

import { DeclarationScope } from "./scope";
import { Diagnostic } from "..";

export interface Size {
  scope: DeclarationScope;
  ident: string;

  nodes: Set<Node>;
  first: Node;
}

export namespace Size {

  /**
   * Finds a size in a declaration scope.
   * 
   * @param scope the declaration scope to search in
   * @param ident the identifier to search for
   * @returns None if the size is not found, Some(Size) if it is found
   */
  export function find(scope: DeclarationScope, ident: Identifier): Option<Size> {
    return ident.value in scope.sizes
      ? Some(scope.sizes[ident.value])
      : None();
  }

  /**
   * Creates a new size object from an identifier.
   * 
   * @param scope the declaration scope to create the size in
   * @param ident the identifier to create the size from
   * @returns a new size object
   */
  export function make(scope: DeclarationScope, ident: Identifier): Size {
    return {
      scope,
      ident: ident.value,

      nodes: new Set([ident]),
      first: ident,
    };
  }

  /**
   * Resolves sizes in a declaration scope.
   * 
   * @param scope to resolve sizes in
   * @param diagnostics to add errors to
   */
  export function resolve(scope: DeclarationScope, diagnostics: Diagnostic[]): void {
    scope.node.sizeDeclList && scope.node.sizeDeclList.decls
      .forEach(size => {
        scope.sizes[size.value] = make(scope, size);
      });

    travel(scope.node.argumentList, isSizeNode)
      .filter(size => size.sizeType === "ident")
      .forEach(sizeNode =>
        find(scope, sizeNode.ident!)
          .map_or_else<unknown>(
            () => scope.sizes[sizeNode.ident!.value] = make(scope, sizeNode.ident!),
            (size) => size.nodes.add(sizeNode),
          )
      );

    travel(scope.node.exprs, isSizeNode)
      .filter(ident => ident.sizeType === "ident")
      .forEach(sizeNode =>
        find(scope, sizeNode.ident!)
          .map_or_else<unknown>(
            () => diagnostics.push({
              message: `Using undeclared size name '${sizeNode.ident!.value}'.`,
              node: sizeNode
            }),
            (size) => size.nodes.add(sizeNode)
          )
      );
  }

}
