import * as fs from "fs";
import * as path from "path";

import { tokenize, TokenizerInput } from "infinite-lang/core/tokenizer";
import { parse, ParserInput, Node } from "infinite-lang/core/parser";

import tokenizers from "../tokens";
import { nnParsers as parsers } from "../parsers";

describe("tokenizer function", () => {
    const success_files = fs.readdirSync(path.join(__dirname, 'tokenize'));
    const fail_files = fs.readdirSync(path.join(__dirname, 'tokenize_fail'));

    function makeTokenizerInput(file: string): TokenizerInput {
        return {
            fileName: file,
            input: fs.readFileSync(path.join(__dirname, file), 'utf8')
        };
    }
    
    success_files.forEach((file) => {
        it(`should tokenize ${file}`, async () => {
            const input = makeTokenizerInput(`tokenize/${file}`);
            const tokens = tokenize(input, tokenizers);
        });
    });

    fail_files.forEach((file) => {
        it(`should fail to tokenize ${file}`, async () => {
            const input = makeTokenizerInput(`tokenize_fail/${file}`);
            const tokens = tokenize(input, tokenizers);

            expect(tokens.is_err()).toBe(true);
        });
    });
});

describe("parser function", () => {
    const files = fs.readdirSync(path.join(__dirname, 'parse'));

    function makeTokenizerInput(file: string): TokenizerInput {
        return {
            fileName: file,
            input: fs.readFileSync(path.join(__dirname, 'parse', file), 'utf8')
        };
    }

    files.forEach((file) => {
        it(`should parse ${file}`, async () => {
            const input = makeTokenizerInput(file);
            const tokens = tokenize(input, tokenizers);

            const parserInput: ParserInput = {
                fileName: file,
                tokens: tokens.unwrap(),
            };

            const ast = parse(parserInput, parsers as any, () => {});
            expect(ast.is_ok()).toBe(true);

            fs.writeFileSync(path.join(__dirname, 'passed', file + '.json'), JSON.stringify(ast, (key, value) => {
                if (key === "children") {
                    return undefined;
                }

                return value;
            }, 2));
        });
    });
});