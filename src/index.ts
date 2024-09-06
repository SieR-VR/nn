import * as ohm from "ohm-js";
import { toAST } from "ohm-js/extras"

import { readFileSync } from "fs";
import { exit } from "process";

import { Declaration } from "./source";
import { synth } from "./synth";

export const nnGrammar = ohm.grammar(
  readFileSync("./src/ohm/nn.ohm", "utf8")
);

const source = `
Linear[input, channel](x: Tensor[input]) = 
  x, Trainable[input, channel]('weight')
  |> MatMul(), Trainable[channel]('bias')
  |> Bias()
`

const ast = nnGrammar.match(source);

if (ast.failed()) {
  console.error("Syntax error");
  exit(1);
}

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

  Type: { isTensor: true, sizes: 1 },

  string: 0,
  singleQuoteString: 1,
  doubleQuoteString: 1,
}

const result = toAST(ast, mapping) as Record<string, any>;
const decl = result as Declaration;

const python = synth.py`
class ${decl.name}:
  def __init__(self, ${decl.sizeDeclList}):
    ${synth.py.inits(decl)}
    
  def __call__(self, ${decl.argumentList}):
    ${synth.py.forward(decl)}
`

console.log(source);
console.log(python);