import { CancellationToken, CompletionList, CompletionParams } from "vscode-languageserver/node";
import { LspContext } from "../types";

export async function completion(params: CompletionParams, context: LspContext, _token?: CancellationToken): Promise<CompletionList | null> {
  const document = context.documents.get(params.textDocument.uri);

  if (!document) {
    return null;
  }

  const completions: CompletionList = {
    items: [],
    isIncomplete: false
  }

  return completions;
}
