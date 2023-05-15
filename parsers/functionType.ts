import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "type", nodeType: "functionType", priority: 0 }, [
    {
        role: "sizeTypeParam",
        condition: ({ nodeType }) => nodeType === "sizeTypeParam",
        key: "sizeTypeParam",
    },
    {
        role: "functionTypeParam",
        condition: ({ nodeType }) => nodeType === "functionTypeParam",
        key: "functionTypeParam",
    },
    {
        tokenType: "Colon",
    },
    {
        role: "type",
        condition: () => true,
        key: "returnType",
    }
] as const);