import { Token } from 'nn-language'
import { SymbolKind } from 'vscode-languageserver/node';

export function getSymbolKind(token: Token): SymbolKind {
  return {
    ['identifier']: SymbolKind.Variable,
    ['valueToken']: SymbolKind.Constant,
    ['specialChars']: SymbolKind.Operator,
    ['string']: SymbolKind.String
  }[token.type]
}

export { LogLevel, Logger, LspClientLogger } from './Logger'
export * from './MarkdownString'
