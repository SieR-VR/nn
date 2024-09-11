import * as ohm from 'ohm-js'

export const grammar = ohm.grammar(`

NN {
  SourceCode = Declaration*

	Declaration = Ident SizeDecls? Arguments "=" "|>"? Expression ("|>" Expression)*
    
  Expression 
    = Expression ( "," Expression ) + -- tuple
    | Ident SizeType? "(" ListOf<Expression, ","> ")" -- call
    | Ident -- ident
    | string -- string
  
  Arguments = "(" ListOf<ArgumentDeclaration, ","> ")"
  ArgumentDeclaration = Ident ":" Type
  
  Type = Ident SizeType?

  SizeType = "[" ListOf<Size, ","> "]"
  Size 
    = Size "^" Size -- pow
    | Size "*" Size -- mul
    | Size "+" Size -- add
    | "(" Size ")" -- paren
    | number
    | Ident
  SizeDecls = "[" ListOf<Ident, ","> "]"

  Ident = identifier

  // Lexical syntax
  
  string = singleQuoteString | doubleQuoteString 
  singleQuoteString = "'" identifier "'"
  doubleQuoteString = "\"" identifier "\""
  
  identifier = identifierName
  identifierName = identifierStart identifierPart*
  identifierStart = "_" | "$" | letter
  identifierPart = identifierStart | digit
  
  number = "1".."9" digit*

  // Lexical rules for syntax highlighting

  Tokens = token*

  token
    = identifier | valueToken | specialChars | any
    
  valueToken
    = string | number

  specialChars = "[" | "]" | "(" | ")" | "," | "^" | "*" | "+" | "=" | "|>" | ":"
}

`)
