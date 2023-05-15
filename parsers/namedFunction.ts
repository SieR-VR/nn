import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "statement", nodeType: "namedFunction", priority: 0, isTopLevel: true }, [
    {
        role: "identifier",
        condition: () => true,
        key: "identifier"
    },
    {
        role: "expression",
        condition: ({ nodeType }) => nodeType === "function",
        key: "function"
    },
] as const);