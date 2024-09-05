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
Linear[channel](x: Tensor) = 
  x, Trainable('weight')
  |> MatMul(), Trainable('bias')
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
    firstExpr: 5,
    otherExprs: 7
  },

  Expression: 0,

  TupleExpression_tuple: { type: "TupleExpression", firstElement: 0, otherElements: 2 },
  CallExpression_call: { type: "CallExpression", callee: 0, sizes: 1, arguments: 3 },
  IdentifierExpression_ident: { type: "IdentifierExpression", ident: 0 },
  StringLiteralExpression: { value: 0 },

  ArgumentDeclaration: { ident: 0, valueType: 2 },

  Type: { isTensor: true, sizes: 1 },

  singleQuoteString: { type: "string", value: 0 },
  doubleQuoteString: { type: "string", value: 0 },
}

const result = toAST(ast, mapping) as Record<string, any>;

const travel = (node: any) => {
  if (typeof node === 'string' || !("type" in node)) return

  if (node.type === "Declaration") {
    node.exprs = [node.firstExpr, ...node.otherExprs];
    delete node.firstExpr;
    delete node.otherExprs;
  }

  if (node.type === "TupleExpression") {
    node.elements = [node.firstElement, ...node.otherElements];
    delete node.firstElement;
    delete node.otherElements;
  }

  const keys = Object.keys(node);
  keys.forEach((key) => {
    if (!node[key]) return;

    if (Array.isArray(node[key])) {
      node[key].forEach((child: any) => {
        travel(child);
      });
    } else if (typeof node[key] === "object") {
      travel(node[key]);
    }
  });
}

travel(result);
const decl = result as Declaration;

const python = synth.py`
class ${decl.name}:
  def __init__(self, ${decl.sizeDeclList}):
    
  def __call__(self, ${decl.argumentList}):
`

console.log(python);