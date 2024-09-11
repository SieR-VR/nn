import { Token } from 'nn-language/parser'
import { SymbolKind } from 'vscode-languageserver';

export function getSymbolKind(token: Token): SymbolKind {
  return {
    ['identifier']: SymbolKind.Variable,
    ['valueToken']: SymbolKind.Constant,
    ['specialChars']: SymbolKind.Operator,
    ['string']: SymbolKind.String
  }[token.type]
}
