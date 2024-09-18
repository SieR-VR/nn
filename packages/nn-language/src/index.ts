import { toAST, } from "ohm-js/extras"
import { Result, Ok, Err } from "ts-features";

import { grammar } from "./grammar";
import { Declaration } from "./ast";
import { Diagnostic, Mapping } from "./types";
import { toPosition } from "./utils";

const mapping: Mapping = {
  Declaration: {
    name: (children) => children[0].toAST(mapping),
    sizeDeclList: 1,
    argumentList: 2,
    firstPipe: (children) => children[4].toAST(mapping) !== null,
    exprs: (children) => [children[5].toAST(mapping), ...children[7].toAST(mapping)],
    position: (children) => toPosition(children),
  },
  SizeDecls: {
    type: "SizeDeclList",
    decls: (children) => children[1].toAST(mapping),
    position: (children) => toPosition(children),
  },
  Arguments: {
    type: "ArgumentList",
    args: (children) => children[1].toAST(mapping),
    position: (children) => toPosition(children),
  },
  ArgumentDeclaration: {
    ident: 0,
    valueType: 2,
    position: (children) => toPosition(children),
  },

  Expression: 0,
  Expression_tuple: {
    type: "TupleExpression",
    elements: (children) => [children[0].toAST(mapping), ...children[2].toAST(mapping)],
    position: (children) => toPosition(children),
  },
  Expression_call: {
    type: "CallExpression",
    callee: 0,
    sizes: 1,
    args: 3,
    position: (children) => toPosition(children),
  },
  Expression_ident: {
    type: "IdentifierExpression",
    ident: 0,
    position: (children) => toPosition(children),
  },
  Expression_string: {
    type: "StringLiteralExpression",
    value: 0,
    position: (children) => toPosition(children),
  },

  Size_pow: {
    type: "SizeNode",
    left: 0,
    right: 2,
    sizeType: "pow",
    position: (children) => toPosition(children),
  },
  Size_mul: {
    type: "SizeNode",
    left: 0,
    right: 2,
    sizeType: "mul",
    position: (children) => toPosition(children),
  },
  Size_add: {
    type: "SizeNode",
    left: 0,
    right: 2,
    sizeType: "add",
    position: (children) => toPosition(children),
  },
  Size_ident: {
    type: "SizeNode",
    ident: 0,
    sizeType: "ident",
    position: (children) => toPosition(children),
  },
  Size_number: {
    type: "SizeNode",
    number: (children) => parseInt(children[0].source.contents, 10),
    sizeType: "number",
    position: (children) => toPosition(children),
  },

  Type: {
    type: "TypeNode",
    isTensor: true,
    sizes: 1,
    position: (children) => toPosition(children),
  },

  Ident: {
    type: "Identifier",
    value: 0,
    position: (children) => toPosition(children),
  },

  string: 0,
  singleQuoteString: 1,
  doubleQuoteString: 1,
}

export function parse(input: string): Result<Declaration[], Diagnostic[]> {
  const match = grammar.match(input);
  
  if (match.failed()) {
    return Err([{ 
      message: match.shortMessage!, 
      position: {
        pos: match.getInterval().startIdx,
        end: match.getInterval().endIdx,
      }
    }]);
  }

  const ast = toAST(match, mapping) as Declaration[];
  return Ok(ast);
}

export { scan, Token } from "./scanner";
export { travel, nodeOnPosition } from "./utils";
export * from "./ast";
