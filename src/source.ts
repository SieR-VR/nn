export interface Declaration {
    name: string
    sizeDeclList: SizeDeclList
    argumentList: ArgumentList
    firstPipe: boolean
    exprs: Expression[]

    type: "Declaration"
}

export interface IdentifierExpression {
    ident: string

    type: "IdentifierExpression"
}

export interface CallExpression {
    callee: string
    sizes: (string | number)[]
    arguments: Expression[]

    type: "CallExpression"
}

export interface TupleExpression {
    elements: Expression[]

    type: "TupleExpression"
}

export interface StringLiteralExpression {
    value: string

    type: "StringLiteralExpression"
}

export type Expression = IdentifierExpression | CallExpression | TupleExpression | StringLiteralExpression

export interface ArgumentList {
    args: { ident: string, valueType: Type }[]

    type: "ArgumentList"
}

export interface Type {
    isTensor: boolean // true
    sizes: (string | number)[]

    type: "Type"
}

export interface SizeDeclList {
    decls: string[]

    type: "SizeDeclList"
}

export type Node =
    | Declaration
    | Expression
    | ArgumentList
    | Type
    | SizeDeclList

export function travel<T>(node: Node, callback: (node: Node) => T | undefined): T[] {
    const result: T[] = []

    const _travel = (node: Node) => {
        const res = callback(node)
        if (res !== undefined) {
            result.push(res)
        }

        if ("exprs" in node) {
            node.exprs.forEach(_travel)
        }

        if ("arguments" in node) {
            node.arguments.forEach(_travel)
        }

        if ("elements" in node) {
            node.elements.forEach(_travel)
        }
    }

    _travel(node)
    return result
}