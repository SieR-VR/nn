import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "expression", nodeType: "functionCall", priority: 1 }, [
    {
        role: "identifier",
        condition: () => true,
        key: "identifier",
        semanticHighlight: "function"
    },
    {
        role: "sizeTypeParam",
        condition: () => true,
        key: "sizeTypeParam",
        isOptional: true
    },
    {
        role: "expressionList",
        condition: () => true,
        key: "params"
    }
] as const);