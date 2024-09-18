import { Diagnostic } from "vscode-languageserver/node";
import { URI } from "vscode-uri";

import {
  parse,
  travel,
  isDeclaration,
} from 'nn-language'

import { check } from "nn-type-checker";

import { LspContext } from "../types";
import { ResourceMap } from "../utils/resourceMap";

export async function validateAllDocuments(context: LspContext, files: ResourceMap<void>): Promise<void> {
  for (const file of files.entries) {
    await validateTextDocument(file.resource, context);
  }
}

export async function validateTextDocument(textDocumentUri: URI, context: LspContext): Promise<void> {
  const textDocument = context.documents.get(textDocumentUri.toString());
  if (!textDocument) {
    return;
  }

  const parseResult = parse(textDocument.getText());
  const diagnostics: Diagnostic[] = [];

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

    context.client.sendDiagnostics({
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
  
  context.client.sendDiagnostics({
    uri: textDocument.uri,
    diagnostics,
  });
}
