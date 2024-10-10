import { CancellationToken, Hover, TextDocumentPositionParams } from "vscode-languageserver/node";
import { LspContext } from "../types";

import {
  SourceFile,
  nodeOnPosition,
} from 'nn-language'

import {
  TypeChecker,
  Type,
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
      Type.toString(vertex.type.unwrap()),
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
