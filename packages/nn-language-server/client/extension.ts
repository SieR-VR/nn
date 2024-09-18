import * as path from "path";
import { ExtensionContext, languages } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";

import { makeProvider, legend } from "./semanticTokenProvider";

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
  const serverModule = context.asAbsolutePath(
    path.join("out", "src", "cli.js")
  );

  console.log(serverModule);

  const serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
    },
  };

  const clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "nn" }],
  };

  client = new LanguageClient(
    "nn",
    "nn Language Server",
    serverOptions,
    clientOptions
  );

  await client.start();

  languages.registerDocumentSemanticTokensProvider(
    { scheme: "file", language: "nn" },
    makeProvider(client),
    legend
  );
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
