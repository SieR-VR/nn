import { DocumentSymbolParams, SemanticTokens, SemanticTokensBuilder, SymbolKind } from "vscode-languageserver";
import { LspContext } from "../types";

import {
  parse,
  travel,
  isCallExpression,
} from 'nn-language'

export function semanticTokens(params: DocumentSymbolParams, context: LspContext): SemanticTokens {
  const document = context.documents.get(params.textDocument.uri);
  const builder = new SemanticTokensBuilder();

  if (!document) {
    console.warn(`Document not found: ${params.textDocument.uri}`);
    return builder.build();
  }

  const parseResult = parse(document.getText());
  if (parseResult.is_err()) {
    console.warn(`Failed to parse document: ${parseResult.unwrap_err()}`);
    return builder.build();
  }

  const ast = parseResult.unwrap();

  const declarations = ast;
  const callExpressions = travel(ast, isCallExpression);

  for (const decl of declarations) {
    const { position } = decl.name;
    const startPos = document.positionAt(position.pos);

    builder.push(startPos.line, startPos.character, position.end - position.pos, SymbolKind.Function, 0);
  }

  for (const call of callExpressions) {
    const { position } = call.callee;
    const startPos = document.positionAt(position.pos);

    builder.push(startPos.line, startPos.character, position.end - position.pos, SymbolKind.Function, 0);
  }

  return builder.build();
}
