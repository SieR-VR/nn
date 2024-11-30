import {
  CancellationToken,
  Hover,
  MarkupContent,
  TextDocumentPositionParams,
} from "vscode-languageserver/node";
import { LspContext } from "../types";

import {
  Declaration,
  isCallExpression,
  isIdentifierExpression,
  isIdentifierSizeNode,
  Node,
  nodeOnPosition,
  SourceFile,
} from "nn-language";

import { Type, TypeChecker } from "nn-type-checker";

import { MarkdownString } from "../utils";

export async function hover(
  params: TextDocumentPositionParams,
  context: LspContext,
  _token?: CancellationToken
): Promise<Hover | null> {
  const document = context.documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }

  const source = SourceFile.parse(document.getText(), params.textDocument.uri);

  const checkContext = TypeChecker.check(source);
  const hoverPosition = document.offsetAt(params.position);

  const hoverContent =
    processHover(source.tree, hoverPosition, isIdentifierSizeNode, (node) =>
      new MarkdownString()
        .appendCodeblock(`(size type) ${node.ident.value}`, "nn")
        .toMarkupContent()
    ) ||
    processHover(source.tree, hoverPosition, isIdentifierExpression, (node) => {
      const vertex = checkContext.vertices.get(node);
      if (!vertex) {
        return null;
      }

      const typeString = vertex.type.is_some() 
        ? Type.toString(vertex.type.unwrap())
        : "Unknown";

      return new MarkdownString()
        .appendCodeblock(`(value) ${node.ident.value}: ${typeString}`, "nn")
        .toMarkupContent()
    }) ||
    processHover(source.tree, hoverPosition, isCallExpression, (node) => 
      new MarkdownString()
        .appendCodeblock(`(function) ${node.callee.value}`, "nn")
        .toMarkupContent()
    );

  if (!hoverContent) {
    return null;
  }

  const [hoverNode, markdown] = hoverContent;

  return {
    contents: markdown,
    range: {
      start: document.positionAt(hoverNode.position.pos),
      end: document.positionAt(hoverNode.position.end),
    },
  };
}

function processHover<T extends Node>(
  tree: Declaration[],
  hoverPosition: number,
  constraint: (node: Node) => node is T,
  toMarkdown: (node: T) => MarkupContent | null
): [Node, MarkupContent] | null {
  const node = nodeOnPosition(tree, hoverPosition, constraint);

  if (!node) {
    return null;
  }

  const markdown = toMarkdown(node);
  if (!markdown) {
    return null;
  }

  return [node, markdown];
}
