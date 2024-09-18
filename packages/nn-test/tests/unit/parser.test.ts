import * as fs from "fs";
import * as path from "path";

import { parse } from 'nn-language';
import { getErrorJson } from "../utils";

const file = fs.readdirSync(path.join(__dirname, 'cases'));

const sources = file.filter((f) => f.endsWith('.nn'));
const errors = file.filter((f) => f.endsWith('.error.json'));

const passes = sources.filter((f) => !errors.includes(`${f.replace('.nn', '')}.error.json`));
const fails = sources.filter((f) => errors.includes(`${f.replace('.nn', '')}.error.json`));


describe("parser", () => {
  passes.forEach((file) => {
    it(`should parse ${file}`, async () => {
      const parserInput = fs.readFileSync(path.join(__dirname, 'cases', file), 'utf8');
      const ast = parse(parserInput);

      expect(ast.isOk).toBe(true);

      if (ast.is_err()) {
        console.log(ast.err, `at ${file}`);
      }

      const decls = ast.unwrap();
      expect(decls).toBeInstanceOf(Array);
    });
  });

  fails.forEach((file) => {
    it(`should fail at ${file}`, async () => {
      const parserInput = fs.readFileSync(path.join(__dirname, 'cases', file), 'utf8');
      const errorJson = getErrorJson(__dirname, file);

      const ast = parse(parserInput);

      expect(ast.isOk).toBe(false);
      expect(ast.err()).toStrictEqual(errorJson);
    });
  });
});
