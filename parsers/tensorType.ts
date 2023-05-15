import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "type", nodeType: "tensorType", priority: 0 }, [
    {
        tokenType: "Tensor",
        determinedBy: true,
    },
    {
        role: "sizeTypeParam",
        condition: ({ nodeType }) => nodeType === "sizeTypeParam",
        key: "sizeTypeParam",
        // isOptional: true,
    },
    {
        role: "primitiveTypeParam",
        condition: ({ nodeType }) => nodeType === "primitiveTypeParam",
        key: "primitiveTypeParam",
    }
] as const);