import * as ohm from "ohm-js";
import { toAST } from "ohm-js/extras"

import { readFileSync } from "fs";
import { Declaration } from "./ast";

import { Result, Ok, Err } from "ts-features";

export const grammar = ohm.grammar(
  readFileSync("./src/ohm/nn.ohm", "utf8")
);

const mapping = {
  Declaration: {
    name: 0,
    sizeDeclList: (children) => ({ type: "SizeDeclList", decls: children[1].toAST(mapping) }),
    argumentList: (children) => ({ type: "ArgumentList", args: children[2].toAST(mapping) }),
    firstPipe: 4,
    exprs: (children) => [children[5].toAST(mapping), ...children[7].toAST(mapping)],
  },

  Expression: 0,

  TupleExpression_tuple: { 
    type: "TupleExpression", 
    elements: (children) => [children[0].toAST(mapping), ...children[2].toAST(mapping)],
  },

  CallExpression_call: { type: "CallExpression", callee: 0, sizes: 1, args: 3 },
  IdentifierExpression_ident: { type: "IdentifierExpression", ident: 0 },
  StringLiteralExpression: { value: 0 },

  ArgumentDeclaration: { ident: 0, valueType: 2 },

  Type: { type: "TypeNode", isTensor: true, sizes: 1 },

  string: 0,
  singleQuoteString: 1,
  doubleQuoteString: 1,
}

export function parse(input: string): Result<Declaration, string> {
  const match = grammar.match(input);
  if (match.failed()) {
    return Err(match.message);
  }

  const ast = toAST(match, mapping) as Declaration;
  return Ok(ast);
}