import { Command } from "commander";
import { MessageType } from "vscode-languageserver";
import { createLspConnection } from "./connection";

const DEFAULT_LOG_LEVEL = MessageType.Info;

const program = new Command('nn-language-server')
  .allowUnknownOption()
  .version('0.0.1')
  .option('--node-ipc', 'Use Node IPC as the transport.')
  .option('--log-level <logLevel>', 'A number indication the log level (4 = log, 3 = info, 2 = warn, 1 = error). Defaults to `3`.')
  .parse(process.argv);

const opts = program.opts();

let logLevel: MessageType = DEFAULT_LOG_LEVEL;
if (opts.logLevel) {
  logLevel = parseInt(opts.logLevel) as MessageType;
  if (logLevel && (logLevel < MessageType.Error || logLevel > MessageType.Log)) {
    console.error(`Invalid --log-level ${logLevel}. Defaults to ${DEFAULT_LOG_LEVEL}.`);
    logLevel = DEFAULT_LOG_LEVEL;
  }
}

createLspConnection({
  showMessageLevel: logLevel,
}).listen();
