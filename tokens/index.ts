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
        highlight: "parameter",
        priority: 0
    },
    {
        tokenType: "LAngleBracket",
        string: "<",
        highlight: "parameter",
        priority: 0
    },
    {
        tokenType: "Let",
        string: "let",
        highlight: "keyword",
        priority: 1
    },
    {
        tokenType: "Tensor",
        string: "Tensor",
        highlight: "type",
        priority: 1
    },
    {
        tokenType: "Equals",
        string: "=",
        highlight: "operator",
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
        highlight: "operator",
        priority: 0
    },
    {
        tokenType: "QuestionMark",
        string: "?",
        highlight: "operator",
        priority: 0
    },
    {
        tokenType: "Plus",
        string: "+",
        highlight: "operator",
        priority: 0
    },
    {
        tokenType: "Minus",
        string: "-",
        highlight: "operator",
        priority: 0
    },
    {
        tokenType: "Identifier",
        regex: /[a-zA-Z_][a-zA-Z0-9_]*/,
        highlight: "property",
        priority: 0
    },
    {
        tokenType: "NumericLiteral",
        regex: /[0-9]+/,
        highlight: "number",
        priority: 0
    }
]);