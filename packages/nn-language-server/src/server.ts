import {
  createConnection,
  DidChangeConfigurationNotification,
  DocumentSymbolParams,
  InitializeResult,
  ProposedFeatures,
  SemanticTokens,
  SemanticTokensBuilder,
  SymbolKind,
  TextDocuments,
  TextDocumentSyncKind,
} from "vscode-languageserver/node";

import {
  TextDocument
} from "vscode-languageserver-textdocument"

import {
  parse,
  travel,
  isDeclaration,
  isCallExpression,
} from 'nn-language'

import {
  resolveNames
} from 'nn-type-checker'

import { getSymbolKind } from './utils';

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

connection.onInitialize((params) => {
  const capabilities = params.capabilities;

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      completionProvider: {
        resolveProvider: true,
      }
    },
  }

  return result;
})

connection.onInitialized(() => {
  connection.client.register(DidChangeConfigurationNotification.type, undefined);
})

connection.onRequest('textDocument/semanticTokens', (handler: DocumentSymbolParams): SemanticTokens => {
  const document = documents.get(handler.textDocument.uri);
  const builder = new SemanticTokensBuilder();

  if (!document) {
    console.warn(`Document not found: ${handler.textDocument.uri}`);
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
})

connection.onCompletion((handler) => {
  const completions = [];
  return completions;
})

documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  const parseResult = parse(textDocument.getText());
  const diagnostics = [];

  if (parseResult.is_err()) {
    return;
  }

  const ast = parseResult.unwrap();
  const declarations = travel(ast, isDeclaration);

  const errors = resolveNames(declarations, textDocument.uri);
  if (errors.is_err()) {
    const resolveErrors = errors.unwrap_err();
    
    resolveErrors.forEach((error) => {
      const startPos = textDocument.positionAt(error.node.position.pos);
      const endPos = textDocument.positionAt(error.node.position.end);

      diagnostics.push({
        severity: 1,
        range: {
          start: startPos,
          end: endPos,
        },
        message: error.message,
      });
    })
  }

  console.log(diagnostics);

  connection.sendDiagnostics({
    uri: textDocument.uri,
    diagnostics,
  });
}

documents.listen(connection);
connection.listen();
