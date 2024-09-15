import { Token } from 'nn-language/parser'
import { MarkupContent, SymbolKind } from 'vscode-languageserver';

export function getSymbolKind(token: Token): SymbolKind {
  return {
    ['identifier']: SymbolKind.Variable,
    ['valueToken']: SymbolKind.Constant,
    ['specialChars']: SymbolKind.Operator,
    ['string']: SymbolKind.String
  }[token.type]
}

export class MarkdownString {
  constructor (public value = '') {}

  appendText(text: string) {
    this.value += MarkdownString.escapeMarkdownSyntaxTokens(text)
      .replace(/[ \t]+/g, (_match, g1) => '&nbsp;'.repeat(g1.length))
      .replace(/>/gm, '\\>')
      .replace(/\n/g, '\n\n');

    return this;
  }

  appendMarkdown(markdown: string) {
    this.value += markdown;
    return this;
  }

  appendCodeblock(code: string, language = '') {
    this.value += '\n```';
    this.value += language;
    this.value += '\n';
    this.value += code;
    this.value += '\n```\n';
    
    return this;
  }

  toMarkupContent(): MarkupContent {
    return {
      kind: 'markdown',
      value: this.value
    }
  }
  
  static escapeMarkdownSyntaxTokens(text: string) {
    return text.replace(/([\\`*_{}[\]()#+\-.!])/g, '\\$1')
  }
}
