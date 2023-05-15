import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "type", nodeType: "primitiveType", priority: 0 }, [
    {
        role: "identifier",
        condition: ({ nodeType }) => nodeType === "identifier",
        key: "identifier",
        semanticHighlight: "type"
    }
] as const);