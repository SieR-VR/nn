import * as ohm from 'ohm-js'

export const grammar = ohm.grammar(`

nn {
  SourceCode = Declaration*

	Declaration = Ident SizeDecls? Arguments "=" "|>"? Expression ("|>" Expression)*
  SizeDecls = "[" ListOf<Ident, ","> "]"
  Arguments = "(" ListOf<ArgumentDeclaration, ","> ")"
  ArgumentDeclaration = Ident ":" Type
    
  Expression 
    = Expression ( "," Expression ) + -- tuple
    | Ident SizeType? "(" ListOf<Expression, ","> ")" -- call
    | Ident -- ident
    | string -- string

  SizeType = "[" ListOf<Size, ","> "]"
  Size 
    = Size "^" Size -- pow
    | Size "*" Size -- mul
    | Size "+" Size -- add
    | "(" Size ")" -- paren
    | Ident -- ident
    | number -- number

  Type = Ident SizeType?

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

  comment = "#" (~"\\n" any)*
  space += comment

  // Lexical rules for syntax highlighting

  Tokens = token*

  token
    = identifier | valueToken | specialChars | any
    
  valueToken
    = string | number

  specialChars = "[" | "]" | "(" | ")" | "," | "^" | "*" | "+" | "=" | "|>" | ":"
}

`)
