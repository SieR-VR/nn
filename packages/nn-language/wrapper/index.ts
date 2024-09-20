import Parser from "tree-sitter";
import { Result, Ok, Err } from "ts-features";

import { parser } from "./treesitter";

import { Declaration } from "./ast";
import { Diagnostic } from "./types";
import { toPosition } from "./utils";
import { convertDeclaration } from "./convert";

export function parse(input: string, oldTree?: Parser.Tree): Result<Declaration[], Diagnostic[]> {
  const parse = parser.parse(input, oldTree);
  
  if (parse.rootNode.hasError) {
    const errors = parse.rootNode.descendantsOfType("ERROR");

    return Err(errors.map((e) => ({
      message: e.text,
      position: toPosition(e),
    })));
  }

  const ast = parse.rootNode.children
    .filter((node) => node.type === "declaration")
    .map(convertDeclaration)
  return Ok(ast);
}

export { travel, nodeOnPosition } from "./utils";
export * from "./ast";
