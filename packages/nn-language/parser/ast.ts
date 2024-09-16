import { Position } from "./types"

export interface Identifier {
  value: string
  
  position: Position
  type: "Identifier"
}

export interface Declaration {
  name: Identifier
  sizeDeclList?: SizeDeclList
  argumentList: ArgumentList
  firstPipe: boolean
  exprs: Expression[]

  position: Position
  type: "Declaration"
}

export interface IdentifierExpression {
  ident: Identifier

  position: Position
  type: "IdentifierExpression"
}

export interface TupleExpression {
  elements: Expression[]

  position: Position
  type: "TupleExpression"
}

export interface CallExpression {
  callee: Identifier
  sizes?: (Identifier | number)[]
  args: Expression[]

  position: Position
  type: "CallExpression"
}

export interface StringLiteralExpression {
  value: Identifier

  position: Position
  type: "StringLiteralExpression"
}

export type Expression = IdentifierExpression | CallExpression | TupleExpression | StringLiteralExpression

export interface ArgumentList {
  args: { ident: Identifier, valueType: TypeNode }[]

  position: Position
  type: "ArgumentList"
}

export interface TypeNode {
  isTensor: boolean // true
  sizes?: (Identifier | number)[]

  position: Position
  type: "TypeNode"
}

export interface SizeDeclList {
  decls: Identifier[]

  position: Position
  type: "SizeDeclList"
}

export type Node =
  | Declaration
  | Expression
  | ArgumentList
  | TypeNode
  | SizeDeclList
  | Identifier

export function isDeclaration(node: Node): node is Declaration {
  return node.type === "Declaration"
}

export function isExpression(node: Node): node is Expression {
  return node.type === "IdentifierExpression"
    || node.type === "CallExpression"
    || node.type === "TupleExpression"
    || node.type === "StringLiteralExpression"
}

export function isIdentifierExpression(node: Node): node is IdentifierExpression {
  return node.type === "IdentifierExpression"
}

export function isCallExpression(node: Node): node is CallExpression {
  return node.type === "CallExpression"
}

export function isTupleExpression(node: Node): node is TupleExpression {
  return node.type === "TupleExpression"
}

export function isStringLiteralExpression(node: Node): node is StringLiteralExpression {
  return node.type === "StringLiteralExpression"
}

export function isIdentifier(node: Node): node is Identifier {
  return node.type === "Identifier"
}

export function isArgumentList(node: Node): node is ArgumentList {
  return node.type === "ArgumentList"
}

export function isTypeNode(node: Node): node is TypeNode {
  return node.type === "TypeNode"
}

export function isSizeDeclList(node: Node): node is SizeDeclList {
  return node.type === "SizeDeclList"
}
