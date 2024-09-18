import { InitializeParams, TextDocuments } from "vscode-languageserver/node";
import { TextDocument } from "vscode-languageserver-textdocument";

import { LspClient } from "./client";
import { Logger } from "./utils";

export interface LspContext {
  showMessageLevel: number;
  client: LspClient
  documents: TextDocuments<TextDocument>
  
  // fileConfigurationManager: FileConfigurationManager;
  initializeParams: InitializeParams;
  // diagnosticQueue: DiagnosticQueue;
  // completionDataCache: CompletionDataCache;
  logger: Logger;
  workspaceRoots: string[];
}
