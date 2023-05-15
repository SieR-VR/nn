import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "expression", nodeType: "block", priority: 0 }, [
    {
        tokenType: "LBrace",
        determinedBy: true,
    },
    {
        role: "statement",
        condition: () => true,
        key: "statements",
        isRepeatable: true,
    },
    {
        role: "expression",
        condition: () => true,
        key: "returnValue",
    },
    {
        tokenType: "RBrace"
    }
] as const);