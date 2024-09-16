import * as vscode from 'vscode';
import { LanguageClient, SymbolKind } from 'vscode-languageclient/node';

const tokenTypes: string[] = []
Object.assign(tokenTypes, {
  [SymbolKind.Variable]: 'variable',
  [SymbolKind.Constant]: 'string',
  [SymbolKind.Operator]: 'operator',
  [SymbolKind.String]: 'string',
  [SymbolKind.Function]: 'function',
})

const tokenModifiers: string[] = [];

export const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

export const makeProvider: (client: LanguageClient) => vscode.DocumentSemanticTokensProvider = (client) => ({
  provideDocumentSemanticTokens(document, cancellation) {
    return client.sendRequest(
      'textDocument/semanticTokens',
      { textDocument: { uri: document.uri.toString() } },
      cancellation
    )
  },
});
