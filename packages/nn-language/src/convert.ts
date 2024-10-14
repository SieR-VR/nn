import Parser from "tree-sitter";

import {
  ArgumentList,
  AssignmentExpression,
  CallExpression,
  Declaration, 
  Expression, 
  Identifier, 
  IdentifierExpression, 
  SizeDeclList, 
  SizeNode, 
  StringLiteralExpression, 
  TupleExpression, 
  TypeNode
} from "./ast";
import { toPosition } from "./utils";
import { SourceFile } from ".";

function convertIdentifier(node: Parser.SyntaxNode | null, _context: SourceFile): Identifier {
  if (!node) {
    throw new Error(`Expected an identifier node, got null`);
  }

  return {
    type: "Identifier",
    value: node.text,
    position: toPosition(node),
  };
}

function convertSizeDeclList(node: Parser.SyntaxNode | null, context: SourceFile): SizeDeclList {
  if (!node) {
    return {
      type: "SizeDeclList",
      decls: [],

      position: { pos: 0, end: 0 },
    };
  }

  return {
    type: "SizeDeclList",
    decls: node.namedChildren
      .map((child) => convertIdentifier(child, context)),

    position: toPosition(node),
  };
}

function convertArgumentList(node: Parser.SyntaxNode | null, context: SourceFile): ArgumentList {
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
      ident: convertIdentifier(child.child(0), context),
      valueType: convertTypeNode(child.child(2), context),
    })),

    position: toPosition(node),
  };
}

export function convertDeclaration(node: Parser.SyntaxNode, context: SourceFile): Declaration {
  return {
    type: "Declaration",
    name: convertIdentifier(node.childForFieldName('name'), context),
    sizeDeclList: convertSizeDeclList(node.childForFieldName('sizeDeclList'), context),
    argumentList: convertArgumentList(node.childForFieldName('argumentList'), context),
    returnType: node.childForFieldName('returnType')
      ? convertTypeNode(node.childForFieldName('returnType'), context)
      : undefined,

    firstPipe: node.childForFieldName('firstPipe') !== null,
    exprs:
      node.childForFieldName('expressions')
        ? [node.childForFieldName('expr_first'), ...node.childrenForFieldName('expr_last')]
          .map((child) => convertExpression(child, context))
        : [],

    position: toPosition(node),
  };
}

function convertTypeNode(node: Parser.SyntaxNode | null, context: SourceFile): TypeNode {
  if (!node) {
    throw new Error("Expected a type node");
  }

  return {
    type: "TypeNode",
    isTensor: true,
    sizes: node.child(1)
      ? node.child(1)!.namedChildren.map((child) => convertSizeNode(child, context))
      : [],
    position: toPosition(node),
  };
}

function convertSizeNode(node: Parser.SyntaxNode | null, context: SourceFile): SizeNode {
  if (!node) {
    throw new Error("Expected a size node");
  }

  switch (node.type) {
    case "size_pow":
      return {
        left: convertSizeNode(node.child(0), context),
        right: convertSizeNode(node.child(2), context),

        sizeType: "pow",
        type: "ArithmeticSizeNode",
        position: toPosition(node),
      };
    case "size_mul":
      return {
        left: convertSizeNode(node.child(0), context),
        right: convertSizeNode(node.child(2), context),

        sizeType: "mul",
        type: "ArithmeticSizeNode",
        position: toPosition(node),
      };
    case "size_div":
      return {
        left: convertSizeNode(node.child(0), context),
        right: convertSizeNode(node.child(2), context),

        sizeType: "div",
        type: "ArithmeticSizeNode",
        position: toPosition(node),
      };
    case "size_add":
      return {
        left: convertSizeNode(node.child(0), context),
        right: convertSizeNode(node.child(2), context),

        sizeType: "add",
        type: "ArithmeticSizeNode",
        position: toPosition(node),
      };
    case "size_sub":
      return {
        left: convertSizeNode(node.child(0), context),
        right: convertSizeNode(node.child(2), context),

        sizeType: "sub",
        type: "ArithmeticSizeNode",
        position: toPosition(node),
      };
    case "size_ident":
      return {
        ident: convertIdentifier(node.child(0), context),

        sizeType: "ident",
        type: "IdentifierSizeNode",
        position: toPosition(node),
      };
    case "size_number":
      return {
        number: parseInt(node.child(0)!.text),

        sizeType: "number",
        type: "NumberSizeNode",
        position: toPosition(node),
      };
    case "size":
    case "size_operation":
      return convertSizeNode(node.child(0), context);
    case "size_paren":
      return convertSizeNode(node.child(1), context);
  }

  return {} as SizeNode;
}

function convertCallExpression(node: Parser.SyntaxNode | null, context: SourceFile): CallExpression {
  if (!node) {
    throw new Error("Expected a call expression node");
  }

  return {
    type: "CallExpression",
    callee: convertIdentifier(node.child(0), context),
    sizes: node.child(1)
      ? node.child(1)!.namedChildren.map((child) => convertSizeNode(child, context))
      : [],
    args: node.children
      .filter((child) => child.type.includes("expression"))
      .map((child) => convertExpression(child, context)),

    position: toPosition(node),
  };
}

function convertTupleExpression(node: Parser.SyntaxNode | null, context: SourceFile): TupleExpression {
  if (!node) {
    throw new Error("Expected a tuple expression node");
  }

  return {
    type: "TupleExpression",
    elements: node.namedChildren.map((child) => convertExpression(child, context)),

    position: toPosition(node),
  };
}

function convertAssignmentExpression(node: Parser.SyntaxNode | null, context: SourceFile): AssignmentExpression {
  if (!node) {
    throw new Error("Expected an assignment expression node");
  }

  return {
    type: "AssignmentExpression",
    left: convertIdentifier(node.child(0), context),
    right: convertExpression(node.child(2), context),
    position: toPosition(node),
  };
}

function convertIdentExpression(node: Parser.SyntaxNode | null, context: SourceFile): IdentifierExpression {
  if (!node) {
    throw new Error("Expected an identifier expression node");
  }

  return {
    type: "IdentifierExpression",
    ident: convertIdentifier(node.child(0), context),
    position: toPosition(node),
  };
}

function convertStringExpression(node: Parser.SyntaxNode | null, _context: SourceFile): StringLiteralExpression {
  if (!node) {
    throw new Error("Expected a string expression node");
  }

  return {
    type: "StringLiteralExpression",
    value: node.text,
    position: toPosition(node),
  };
}

function convertExpression(node: Parser.SyntaxNode | null, context: SourceFile): Expression {
  if (!node) {
    throw new Error("Expected an expression node");
  }

  switch (node.type) {
    case "expression_call":
      return convertCallExpression(node, context);
    case "expression_tuple":
      return convertTupleExpression(node, context);
    case "expression_assign":
      return convertAssignmentExpression(node, context);
    case "expression_ident":
      return convertIdentExpression(node, context);
    case "expression_string":
      return convertStringExpression(node, context);
    case "expression":
    case "expression_plain":
      return convertExpression(node.child(0), context);
    default:
      throw new Error(`Unknown expression type: ${node.type}`);
  }
}
