import Parser from "tree-sitter";

import { ArgumentList, CallExpression, Declaration, Expression, Identifier, IdentifierExpression, Node, SizeDeclList, SizeNode, StringLiteralExpression, TupleExpression, TypeNode } from "./ast";
import { toPosition } from "./utils";

function convertIdentifier(node: Parser.SyntaxNode | null): Identifier {
  if (!node) {
    throw new Error("Expected an identifier node");
  }

  return {
    type: "Identifier",
    value: node.text,
    position: toPosition(node),
  };
}

function convertSizeDeclList(node: Parser.SyntaxNode | null): SizeDeclList {
  if (!node) {
    return {
      type: "SizeDeclList",
      decls: [],

      position: { pos: 0, end: 0 },
    };
  }

  return {
    type: "SizeDeclList",
    decls: node.namedChildren.map(convertIdentifier),

    position: toPosition(node),
  };
}

function convertArgumentList(node: Parser.SyntaxNode | null): ArgumentList {
  if (!node) {
    return {
      type: "ArgumentList",
      args: [],

      position: { pos: 0, end: 0 },
    };
  }

  return {
    type: "ArgumentList",
    args: node.namedChildren.map((child) => ({
      ident: convertIdentifier(child.child(0)),
      valueType: convertTypeNode(child.child(2)),
    })),

    position: toPosition(node),
  };
}

export function convertDeclaration(node: Parser.SyntaxNode): Declaration {
  return {
    type: "Declaration",
    name: convertIdentifier(node.child(0)),
    sizeDeclList: convertSizeDeclList(node.child(1)),
    argumentList: convertArgumentList(node.child(2)),

    firstPipe: node.childForFieldName("firstPipe") !== null,
    exprs: node.namedChildren
      .filter((child) => child.type === "expression")
      .map(convertExpression),

    position: toPosition(node),
  };
}

function convertTypeNode(node: Parser.SyntaxNode | null): TypeNode { 
  if (!node) {
    throw new Error("Expected a type node");
  }

  return {
    type: "TypeNode",
    isTensor: true,
    sizes: node.child(1)
      ? node.child(1)!.namedChildren.map(convertSizeNode)
      : [],
    position: toPosition(node),
  };
}

function convertSizeNode(node: Parser.SyntaxNode | null): SizeNode {
  if (!node) {
    throw new Error("Expected a size node");
  }

  switch (node.type) {
    case "size_pow":
      return {
        left: convertSizeNode(node.child(0)),
        right: convertSizeNode(node.child(2)),

        sizeType: "pow",
        type: "SizeNode",
        position: toPosition(node),
      };
    case "size_mul":
      return {
        left: convertSizeNode(node.child(0)),
        right: convertSizeNode(node.child(2)),

        sizeType: "mul",
        type: "SizeNode",
        position: toPosition(node),
      };
    case "size_add":
      return {
        left: convertSizeNode(node.child(0)),
        right: convertSizeNode(node.child(2)),

        sizeType: "add",
        type: "SizeNode",
        position: toPosition(node),
      };
    case "size_ident":
      return {
        ident: convertIdentifier(node.child(0)),

        sizeType: "ident",
        type: "SizeNode",
        position: toPosition(node),
      };
    case "size_number":
      return {
        number: parseInt(node.child(0)!.text),

        sizeType: "number",
        type: "SizeNode",
        position: toPosition(node),
      };
    case "size":
    case "size_operation":
      return convertSizeNode(node.child(0));
  }

  return {} as SizeNode;
}

function convertCallExpression(node: Parser.SyntaxNode | null): CallExpression {
  if (!node) {
    throw new Error("Expected a call expression node");
  }

  return {
    type: "CallExpression",
    callee: convertIdentifier(node.child(0)),
    sizes: node.child(1)
      ? node.child(1)!.namedChildren.map(convertSizeNode)
      : [],
    args: node.children
      .filter((child) => child.type.includes("expression"))
      .map(convertExpression),

    position: toPosition(node),
  };
}

function convertTupleExpression(node: Parser.SyntaxNode | null): TupleExpression {
  if (!node) {
    throw new Error("Expected a tuple expression node");
  }

  return {
    type: "TupleExpression",
    elements: node.namedChildren.map(convertExpression),

    position: toPosition(node),
  };
}

function convertIdentExpression(node: Parser.SyntaxNode | null): IdentifierExpression {
  if (!node) {
    throw new Error("Expected an identifier expression node");
  }

  return {
    type: "IdentifierExpression",
    ident: convertIdentifier(node.child(0)),
    position: toPosition(node),
  };
}

function convertStringExpression(node: Parser.SyntaxNode | null): StringLiteralExpression {
  if (!node) {
    throw new Error("Expected a string expression node");
  }

  return {
    type: "StringLiteralExpression",
    value: node.text,
    position: toPosition(node),
  };
}

function convertExpression(node: Parser.SyntaxNode | null): Expression {
  if (!node) {
    throw new Error("Expected an expression node");
  }

  switch (node.type) {
    case "expression_call":
      return convertCallExpression(node);
    case "expression_tuple":
      return convertTupleExpression(node);
    case "expression_ident":
      return convertIdentExpression(node);
    case "expression_string":
      return convertStringExpression(node);
    case "expression":
    case "expression_plain":
      return convertExpression(node.child(0));
    default:
      throw new Error(`Unknown expression type: ${node.type}`);
  }
}
