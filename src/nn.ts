import * as fs from "fs";
import * as path from "path";

import { Command } from "commander";

import { parse } from "nn-language";
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
const parsed = parse(content);

if (parsed.is_err()) {
  const lines = content
    .split("\n")

  parsed.unwrap_err().forEach((e) => {
    const [line, pos] = (() => {
      let pos = 0;

      const line = lines.findIndex((l) => {
        pos += l.length + 1;
        return pos >= e.position.pos;
      });
      
      return [line, e.position.pos + pos - lines[line].length];
    })();

    const errorLine = ' '.repeat(pos) + '^'.repeat(e.position.end - e.position.pos);

    lines.forEach((l, i) => {
      console.log(`${i + 1} | ${l}`);

      if (i === line) {
        const pad = ' '.repeat(String(i + 1).length + 2);

        console.log(`${pad}${errorLine}`);
      }
    })

    console.error(`
Unexpected ${e.message}. ${opts.file}:${line + 1}:${pos + 1}
    `);
  });

  exit(1);
}

const ast = parsed.unwrap();
const checker = TypeChecker.check(ast, file);

if (checker.diagnostics.length) {
  const lines = content
    .split("\n")

  checker.diagnostics.forEach(({ message, node: e }) => {
    const [line, pos] = (() => {
      let pos = 0;

      const line = lines.findIndex((l) => {
        pos += l.length + 1;
        return pos >= e.position.pos;
      });
      
      return [line, e.position.pos - pos + lines[line].length + 2];
    })();

    const errorLine = ' '.repeat(pos) + '^'.repeat(e.position.end - e.position.pos);

    lines.forEach((l, i) => {
      console.log(`${i + 1} | ${l}`);

      if (i === line) {
        const pad = ' '.repeat(String(i + 1).length + 2);

        console.log(`${pad}${errorLine}`);
      }
    })

    console.error(`
${message} ${opts.file}:${line + 1}:${pos + 1}
    `);
  });

  exit(1);
}

const python = ast.map((decl) => {
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
