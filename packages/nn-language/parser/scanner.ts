import { toAST } from "ohm-js/extras"
import { Result, Ok, Err } from "ts-features";

import { grammar } from "./grammar";
import { Mapping, Position } from "./types";
import { toPosition } from "./utils";

export interface Token {
  span: string;
  type: "identifier" | "valueToken" | "specialChars" | "string";
  position: Position
}

const mapping: Mapping = {
  Tokens: 0,
  token: 0,
  identifier: { span: (children) => children[0].source.contents, position: (children) => toPosition(children) },
  valueToken: { span: (children) => children[0].source.contents, position: (children) => toPosition(children) },
  specialChars: { span: (children) => children[0].source.contents, position: (children) => toPosition(children) },
  string: { span: (children) => children[0].source.contents, position: (children) => toPosition(children) },
}

export function scan(input: string): Result<Token[], string> {
  const match = grammar.match(input, "Tokens");
  if (match.failed()) {
    return Err(match.message);
  }

  const ast = toAST(match, mapping) as Token[];

  return Ok(ast);
}
