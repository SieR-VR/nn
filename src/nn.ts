import * as fs from "fs";
import * as path from "path";

import { Command } from "commander";

import { SourceFile } from "nn-language";
import { TypeChecker } from "nn-type-checker";
import { codegen, getSettings } from "nn-codegen";

import { exit } from "process";

const program = new Command("nn")
  .version("0.1")
  .argument("<file>", "File to compile")
  .option("-o, --output <output>", "Output python file path")
  .option(
    "-t, --target <target>",
    "Target framework settings file or framework name"
  )
  .usage("[options] <file>")
  .showHelpAfterError()
  .parse(process.argv);

const opts = program.opts();
const [filePath] = program.args;

const file = path.resolve(filePath);

const content = fs.readFileSync(file, "utf-8");

const source = SourceFile.parse(content, file);
const checkContext = TypeChecker.check(source);

const diagnostics = [...source.diagnostics, ...checkContext.diagnostics];

if (diagnostics.length) {
  const lines = content.split("\n");

  diagnostics.forEach(({ message, position }) => {
    const [diagnosticLine, diagnosticPos] = (() => {
      let pos = 0;

      const line = lines.findIndex((l) => {
        pos += l.length + 1;
        return pos >= position.pos;
      });

      return [line, position.pos - pos + lines[line].length + 1];
    })();

    const maxLength = String(lines.length).length;
    const errorLine =
      " ".repeat(diagnosticPos + maxLength) +
      "^".repeat(position.end - position.pos);

    const getLinePad = (i: number) => {
      return " ".repeat(maxLength - String(i).length);
    };

    const lower = Math.max(0, diagnosticLine - 2);
    const upper = Math.min(lines.length, diagnosticLine + 2);

    const contextLines = lines.slice(lower, upper);

    contextLines.forEach((l, i) => {
      const line = lower + i;
      console.log(`${line + 1}${getLinePad(line + 1)} | ${l}`);

      if (line === diagnosticLine) {
        const pad = " ".repeat(String(i + 1).length + 2);

        console.log(`${pad}${errorLine}`);
      }
    });

    console.error(
      "\n" +
        `> ${message} ${opts.file}:${diagnosticLine + 1}:${diagnosticPos + 1}`
    );
  });

  exit(1);
}

const settings = getSettings(opts.target, (path: string) =>
  fs.readFileSync(path, "utf-8")
);
const python = codegen(source, checkContext, settings);

const output =
  opts.output ||
  path.join(process.cwd(), path.basename(file.replace(/\.nn$/, "") + ".py"));

fs.writeFileSync(output, python);
