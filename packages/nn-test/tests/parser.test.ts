import * as fs from "fs";
import * as path from "path";

import { SourceFile } from 'nn-language';
import { getErrorJson } from "./utils";

const file = fs.readdirSync(path.join(__dirname, 'cases'));

const sources = file.filter((f) => f.endsWith('.nn'));
const errors = file.filter((f) => f.endsWith('.error.json'));

const ok = sources.filter((f) => !errors.includes(`${f.replace('.nn', '')}.error.json`));
const err = sources.filter((f) => errors.includes(`${f.replace('.nn', '')}.error.json`));

describe("parser", () => {
  ok.forEach((file) => {
    it(`should parse ${file}`, async () => {
      const parserInput = fs.readFileSync(path.join(__dirname, 'cases', file), 'utf8');
      const source = SourceFile.parse(parserInput);

      expect(source.diagnostics.length).toBe(0);
    });
  });

  err.forEach((file) => {
    it(`should emit errors at ${file}`, async () => {
      const parserInput = fs.readFileSync(path.join(__dirname, 'cases', file), 'utf8');
      const errorJson = getErrorJson(__dirname, file);

      const source = SourceFile.parse(parserInput);

      expect(source.diagnostics.length).toBeGreaterThan(0);
      expect(source.diagnostics).toStrictEqual(errorJson);  
    });
  });
});
