import { Position } from "./types"

export interface Node {
  position: Position
  type: string
}

export interface SizeDeclList extends Node {
  decls: Identifier[]

  type: "SizeDeclList"
}

export interface ArgumentList extends Node {
  args: { ident: Identifier, valueType: TypeNode }[]

  type: "ArgumentList"
}

export interface Identifier extends Node {
  value: string

  type: "Identifier"
}

export interface Declaration extends Node {
  name: Identifier
  sizeDeclList: SizeDeclList
  argumentList: ArgumentList

  firstPipe: boolean
  exprs: Expression[]
  
  returnType?: TypeNode

  commentLeading: string[],
  commentTrailing: string[],
  type: "Declaration"
}

export interface CallExpression extends Node {
  callee: Identifier
  sizes?: SizeNode[]
  args: Expression[]

  type: "CallExpression"
}

export interface TupleExpression extends Node {
  elements: Expression[]

  type: "TupleExpression"
}

export interface AssignmentExpression extends Node {
  left: Identifier
  right: Expression

  type: "AssignmentExpression"
}

export interface IdentifierExpression extends Node {
  ident: Identifier

  type: "IdentifierExpression"
}

export interface StringLiteralExpression extends Node {
  value: string

  type: "StringLiteralExpression"
}

export type Expression =
  | CallExpression
  | TupleExpression
  | AssignmentExpression
  | IdentifierExpression
  | StringLiteralExpression

export interface ArithmeticSizeNode extends Node {
  left: SizeNode
  right: SizeNode

  sizeType: "pow" | "mul" | "div" | "add" | "sub"
  type: "ArithmeticSizeNode"
}

export interface IdentifierSizeNode extends Node {
  ident: Identifier

  sizeType: "ident"
  type: "IdentifierSizeNode"
}

export interface NumberSizeNode extends Node {
  number: number

  sizeType: "number"
  type: "NumberSizeNode"
}

export type SizeNode =
  | ArithmeticSizeNode
  | IdentifierSizeNode
  | NumberSizeNode

export interface TypeNode extends Node {
  isTensor: boolean // true
  sizes?: SizeNode[]

  type: "TypeNode"
}

export function isDeclaration(node: Node): node is Declaration {
  return node.type === "Declaration"
}

export function isSizeDeclList(node: Node): node is SizeDeclList {
  return node.type === "SizeDeclList"
}

export function isArgumentList(node: Node): node is ArgumentList {
  return node.type === "ArgumentList"
}

export function isExpression(node: Node): node is Expression {
  return node.type === "IdentifierExpression"
    || node.type === "CallExpression"
    || node.type === "AssignmentExpression"
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

export function isAssignmentExpression(node: Node): node is AssignmentExpression {
  return node.type === "AssignmentExpression"
}

export function isStringLiteralExpression(node: Node): node is StringLiteralExpression {
  return node.type === "StringLiteralExpression"
}

export function isIdentifier(node: Node): node is Identifier {
  return node.type === "Identifier"
}

export function isTypeNode(node: Node): node is TypeNode {
  return node.type === "TypeNode"
}

export function isSizeNode(node: Node): node is SizeNode {
  return isArithmeticSizeNode(node)
    || isIdentifierSizeNode(node)
    || isNumberSizeNode(node)
}

export function isArithmeticSizeNode(node: Node): node is ArithmeticSizeNode {
  return node.type === "ArithmeticSizeNode"
}

export function isIdentifierSizeNode(node: Node): node is IdentifierSizeNode {
  return node.type === "IdentifierSizeNode"
}

export function isNumberSizeNode(node: Node): node is NumberSizeNode {
  return node.type === "NumberSizeNode"
}
