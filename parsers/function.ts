import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "expression", nodeType: "function", priority: 0 }, [
    {
        role: "sizeTypeParam",
        condition: () => true,
        key: "sizeTypeParam"
    },
    {
        role: "functionParam",
        condition: () => true,
        key: "functionParam",
    },
    {
        tokenType: "Colon",
    },
    {
        role: "type",
        condition: () => true,
        key: "returnType",
    },
    {
        role: "expression",
        condition: ({ nodeType }) => nodeType === "block",
        key: "statements"
    }
] as const);