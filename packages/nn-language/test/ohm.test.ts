import * as fs from "fs";
import * as path from "path";

import { grammar } from "../parser/grammar";

describe("ohm", () => {
  const okFiles = fs.readdirSync(path.join(__dirname, 'parse'));

  okFiles.forEach((file) => {
    it(`should parse ${file}`, async () => {
      const parserInput = fs.readFileSync(path.join(__dirname, 'parse', file), 'utf8');
      const ast = grammar.match(parserInput);

      if (ast.failed()) {
        console.log(ast.message, `at ${file}`);
      }

      expect(ast.succeeded()).toBe(true);
    });
  });

  const failFiles = fs.readdirSync(path.join(__dirname, 'parse_fail'));

  failFiles.forEach((file) => {
    it(`should fail at ${file}`, async () => {
      const parserInput = fs.readFileSync(path.join(__dirname, 'parse_fail', file), 'utf8');
      const ast = grammar.match(parserInput);

      if (ast.failed()) {
        console.log(ast.message, `at ${file}`);
      }

      expect(ast.succeeded()).toBe(false);
    });
  });
});
