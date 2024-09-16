import {
  createConnection,
  DidChangeConfigurationNotification,
  DocumentSymbolParams,
  Hover,
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
  nodeOnPosition,
  isExpression,
} from 'nn-language'

import {
  check,
} from 'nn-type-checker'

import {
  MarkdownString
} from './utils'

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

connection.onInitialize((params) => {
  const capabilities = params.capabilities;

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Incremental,
      hoverProvider: true,
      completionProvider: {
        resolveProvider: true,
      },
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

connection.onHover((handler) => {
  const document = documents.get(handler.textDocument.uri);
  if (!document) {
    return null;
  }

  const parseResult = parse(document.getText());
  if (parseResult.is_err()) {
    return null;
  }

  const ast = parseResult.unwrap();
  const declarations = travel(ast, isDeclaration);

  const checkContext = check(declarations, handler.textDocument.uri);
  const hoverPosition = document.offsetAt(handler.position);

  const node = nodeOnPosition(
    ast, 
    hoverPosition, 
    (node) => checkContext.vertices.has(node)
  );
  const vertex = checkContext.vertices.get(node);

  if (!vertex) {
    return null;
  }

  const markdown = new MarkdownString();

  if (vertex.type !== null) {
    markdown.appendCodeblock(
      `Tensor[${vertex.type.shape.map(size => typeof size === 'number' ? size : size.ident).join(', ')}]`,
      'nn'
    );
  }
  else {
    markdown.appendText('Unknown');
  }

  return {
    contents: markdown.toMarkupContent(),
    range: {
      start: document.positionAt(vertex.expression.position.pos),
      end: document.positionAt(vertex.expression.position.end),
    }
  }
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
    const [diagnostic] = parseResult.unwrap_err();

    const startPos = textDocument.positionAt(diagnostic.position.pos);
    const endPos = textDocument.positionAt(diagnostic.position.end);

    diagnostics.push({
      range: {
        start: startPos,
        end: endPos,
      },
      severity: 1,
      message: diagnostic.message,
      source: 'nn-language-server',
    });

    connection.sendDiagnostics({
      uri: textDocument.uri,
      diagnostics,
    });

    return;
  }

  const ast = parseResult.unwrap();
  const declarations = travel(ast, isDeclaration);

  const checkContext = check(declarations, textDocument.uri);

  checkContext.diagnostics.forEach(diagnostic => {
    const { position } = diagnostic.node;
    const startPos = textDocument.positionAt(position.pos);
    const endPos = textDocument.positionAt(position.end);

    diagnostics.push({
      range: {
        start: startPos,
        end: endPos,
      },
      severity: 1,
      message: diagnostic.message,
      source: 'nn-language-server',
    });
  });

  console.log(diagnostics);

  connection.sendDiagnostics({
    uri: textDocument.uri,
    diagnostics,
  });
}

documents.listen(connection);
connection.listen();
