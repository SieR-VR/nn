import * as fs from "fs";
import * as path from "path";

import { Command } from "commander";

import { SourceFile } from "nn-language";
import { TypeChecker } from "nn-type-checker";

import { synth } from "./synth" 
import { exit } from "process";

const program = new Command('nn')
  .version('0.1')
  .option('-f, --file <file>', 'File to compile')
  .option('-o, --output <output>', 'Output python file')
  .parse(process.argv);

const opts = program.opts();
const file = path.resolve(opts.file);

const content = fs.readFileSync(file, 'utf-8');

const source = SourceFile.parse(content, file);
const checkContext = TypeChecker.check(source);

const diagnostics = [
  ...source.diagnostics,
  ...checkContext.diagnostics,
]

if (diagnostics.length) {
  const lines = content
    .split("\n")

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
    const errorLine = ' '.repeat(diagnosticPos + maxLength) + '^'.repeat(position.end - position.pos);

    const getLinePad = (i: number) => {
      return ' '.repeat(maxLength - String(i).length);
    }

    const lower = Math.max(0, diagnosticLine - 2);
    const upper = Math.min(lines.length, diagnosticLine + 2);

    const contextLines = lines.slice(lower, upper);

    contextLines.forEach((l, i) => {
      const line = lower + i;
      console.log(`${line + 1}${getLinePad(line + 1)} | ${l}`);

      if (line === diagnosticLine) {
        const pad = ' '.repeat(String(i + 1).length + 2);

        console.log(`${pad}${errorLine}`);
      }
    })

    console.error(`
> ${message} ${opts.file}:${diagnosticLine + 1}:${diagnosticPos + 1}
    `);
  });

  exit(1);
}

const python = source.tree.map((decl) => {
  return synth.py`from tinygrad import Tensor
  
class ${decl.name.value}:
  def __init__(self, ${decl.sizeDeclList}):
    ${synth.py.inits(decl)}
    
  def __call__(self, ${decl.argumentList}):
    ${synth.py.forward(decl)}
  `
}).join("\n");

const output = opts.output 
  || path.join(process.cwd(), path.basename(file.replace(/\.nn$/, '') + '.py'));

fs.writeFileSync(output, python);
