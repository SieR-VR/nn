import Parser from "tree-sitter";

import { Declaration } from "./ast";
import { Diagnostic } from "./types";
import { toPosition } from "./utils";
import { parser } from "./treesitter";
import { convertDeclaration } from "./convert";
import { Node, NodeContext } from "./node";

export interface SourceFile {
  path: string;
  content: string;

  oldTree: Parser.Tree;
  tree: Declaration[];

  diagnostics: Diagnostic[];

  _context: {
    node: NodeContext;
  };
}

export namespace SourceFile {
  function getErrorNodes(root: Parser.SyntaxNode): Parser.SyntaxNode[] {
    const travel = (
      node: Parser.SyntaxNode,
      acc: Parser.SyntaxNode[]
    ): Parser.SyntaxNode[] => {
      if (node.isError) {
        acc.push(node);
        return acc;
      }

      for (const child of node.children) {
        travel(child, acc);
      }

      return acc;
    };

    return travel(root, []);
  }

  function getMessageForErrorNode(node: Parser.SyntaxNode): string {
    const child = node.child(0);

    if (child && child.type !== "ERROR") {
      return `Unexpected ${child.type}.`;
    } else {
      return `Unexpected token '${node.text}'.`;
    }
  }

  export function parse(
    content: string,
    path: string,
    old?: SourceFile
  ): SourceFile {
    const parse = parser.parse(content, old?.oldTree);
    const result: SourceFile = old ?? {
      content,
      path,
      oldTree: parse,
      tree: [],
      diagnostics: [],
      _context: {
        node: {
          nextId: 0,
          nodes: new Map<number, Node>(),
        }
      }
    };

    result.diagnostics = getErrorNodes(parse.rootNode).map((node) => ({
      message: getMessageForErrorNode(node),
      position: toPosition(node),
    }));

    result.tree = parse.rootNode.children
      .filter((node) => node.type === "declaration")
      .map((declNode) => convertDeclaration(declNode, result));

    return result;
  }
}

export * from "./utils";
export * from "./types";
export * from "./ast";
export * from "./ast-is";
