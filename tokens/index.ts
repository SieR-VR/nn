import { makeTokenizeRule } from "infinite-lang/rule/tokenizer"

export default makeTokenizeRule([
    {
        tokenType: "LParen",
        string: "(",
        priority: 0
    },
    {
        tokenType: "RParen",
        string: ")",
        priority: 0
    },
    {
        tokenType: "LBracket",
        string: "[",
        priority: 0
    },
    {
        tokenType: "RBracket",
        string: "]",
        priority: 0
    },
    {
        tokenType: "LBrace",
        string: "{",
        priority: 0
    },
    {
        tokenType: "RBrace",
        string: "}",
        priority: 0
    },
    {
        tokenType: "RAngleBracket",
        string: ">",
        priority: 0
    },
    {
        tokenType: "LAngleBracket",
        string: "<",
        priority: 0
    },
    {
        tokenType: "Let",
        string: "let",
        priority: 1
    },
    {
        tokenType: "Tensor",
        string: "Tensor",
        priority: 1
    },
    {
        tokenType: "Equals",
        string: "=",
        priority: 0
    },
    {
        tokenType: "Comma",
        string: ",",
        priority: 0
    },
    {
        tokenType: "Colon",
        string: ":",
        priority: 0
    },
    {
        tokenType: "Semicolon",
        string: ";",
        priority: 0
    },
    {
        tokenType: "Dotdotdot",
        string: "...",
        priority: 0
    },
    {
        tokenType: "QuestionMark",
        string: "?",
        priority: 0
    },
    {
        tokenType: "Plus",
        string: "+",
        priority: 0
    },
    {
        tokenType: "Minus",
        string: "-",
        priority: 0
    },
    {
        tokenType: "Identifier",
        regex: /[a-zA-Z_][a-zA-Z0-9_]*/,
        priority: 0
    },
    {
        tokenType: "NumericLiteral",
        regex: /[0-9]+/,
        priority: 0
    }
]);