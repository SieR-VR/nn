import { CancellationToken, Hover, TextDocumentPositionParams } from "vscode-languageserver/node";
import { LspContext } from "../types";

import {
  SourceFile,
  nodeOnPosition,
} from 'nn-language'

import {
  TypeChecker,
  Size,
  SizeType,
} from 'nn-type-checker'

import { MarkdownString } from "../utils";

export async function hover(params: TextDocumentPositionParams, context: LspContext, token?: CancellationToken): Promise<Hover | null> {
  const document = context.documents.get(params.textDocument.uri);
  if (!document) {
    return null;
  }

  const source = SourceFile.parse(document.getText(), params.textDocument.uri);

  const checkContext = TypeChecker.check(source);
  const hoverPosition = document.offsetAt(params.position);

  const node = nodeOnPosition(
    source.tree,
    hoverPosition,
    (node) => checkContext.vertices.has(node)
  );

  if (!node) {
    return null;
  }

  const vertex = checkContext.vertices.get(node);

  if (!vertex) {
    return null;
  }

  const markdown = new MarkdownString();

  if (vertex.type.is_some()) {
    markdown.appendCodeblock(
      `Tensor[${
        vertex.type.unwrap()
          .shape
          .map(sizeTypeToString)
          .join(', ')
      }]`,
      'nn'
    );
  }
  else {
    markdown.appendText('Unknown');
  }
  console.log('hover', markdown.toMarkupContent())

  return {
    contents: markdown.toMarkupContent(),
    range: {
      start: document.positionAt(vertex.expression.position.pos),
      end: document.positionAt(vertex.expression.position.end),
    }
  }
}

function sizeTypeToString(type: SizeType): string {
  const computeKindMap = {
    'pow': '^',
    'mul': '*',
    'div': '/',
    'add': '+',
    'sub': '-',
  }

  switch (type.computeKind) {
    case 'pow':
    case 'mul':
    case 'div':
    case 'add':
    case 'sub':
      return `(${sizeTypeToString(type.left as SizeType)} ${computeKindMap[type.computeKind]} ${sizeTypeToString(type.right!)})`;
    case 'ident':
      return (type.left as Size).ident
    case 'number':
      return type.left.toString();
  }
}
