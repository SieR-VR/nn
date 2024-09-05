export interface Declaration {
    name: string
    sizeDeclList: SizeDeclList
    argumentList: ArgumentList
    firstPipe: boolean
    exprs: Expression
}

export interface IdentifierExpression {
    ident: string
}

export interface CallExpression {
    callee: string
    sizes: (string | number)[]
    arguments: Expression[]
}

export interface TupleExpression {
    elements: Expression[]
}

export type Expression = IdentifierExpression | CallExpression | TupleExpression

export interface ArgumentList {
    args: { ident: string, valueType: Type }[]
}

export interface Type {
    isTensor: boolean // true
    sizes: (string | number)[]
}

export interface SizeDeclList {
    decls: string[]
}