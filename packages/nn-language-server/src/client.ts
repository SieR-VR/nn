import { Connection, LogMessageNotification, LogMessageParams, MessageType, PublishDiagnosticsParams } from "vscode-languageserver/node";

export class LspClient {
  constructor(public connection: Connection) {}

  sendDiagnostics(params: PublishDiagnosticsParams) {
    this.connection.sendDiagnostics(params);
  }

  showErrorMessage(message: string) {
    this.connection.sendNotification(LogMessageNotification.type, { type: MessageType.Error, message })
  }

  logMessage(message: LogMessageParams) {
    this.connection.sendNotification(LogMessageNotification.type, message);
  }
}
