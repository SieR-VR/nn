import * as fs from "fs";
import * as path from "path";

import { parse } from "../parser";

describe("parser", () => {
  const okFiles = fs.readdirSync(path.join(__dirname, 'parse'));

  okFiles.forEach((file) => {
    it(`should parse ${file}`, async () => {
      const parserInput = fs.readFileSync(path.join(__dirname, 'parse', file), 'utf8');
      const ast = parse(parserInput);

      expect(ast.isOk).toBe(true);

      if (ast.is_err()) {
        console.log(ast.err, `at ${file}`);
      }

      const decls = ast.unwrap();
      expect(decls).toBeInstanceOf(Array);

      fs.writeFileSync(
        path.join(__dirname, 'passed', `${file}.json`), 
        JSON.stringify(decls, null, 2)
      );
    });
  });

  const failFiles = fs.readdirSync(path.join(__dirname, 'parse_fail'));

  failFiles.forEach((file) => {
    it(`should fail at ${file}`, async () => {
      const parserInput = fs.readFileSync(path.join(__dirname, 'parse_fail', file), 'utf8');
      const ast = parse(parserInput);

      expect(ast.isOk).toBe(false);
    });
  });
});
