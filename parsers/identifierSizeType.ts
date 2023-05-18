import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "sizeType", nodeType: "identifierSizeType", priority: 0 }, [
    {
        role: "identifier",
        condition: (p) => true,
        key: "identifier",
    }
] as const);