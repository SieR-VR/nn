import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "primitiveTypeParam", nodeType: "primitiveTypeParam", priority: 0 }, [
    {
        tokenType: "LAngleBracket",
    },
    {
        role: "type",
        condition: ({ nodeType }) => nodeType === "primitiveType",
        key: "type",
    },
    {
        tokenType: "RAngleBracket",
    }
] as const);