import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "statement", nodeType: "let", priority: 0 }, [
    {
        tokenType: "Let",
        determinedBy: true,
    },
    {
        role: "variableWithType",
        condition: () => true,
        key: "variable"
    },
    {
        tokenType: "Equals"
    },
    {
        role: "expression",
        condition: () => true,
        key: "expression"
    },
    {
        tokenType: "Semicolon"
    }
] as const);