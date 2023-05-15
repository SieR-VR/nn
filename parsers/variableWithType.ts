import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "variableWithType", nodeType: "variableWithType", priority: 0 }, [
    {
        role: "identifier",
        condition: () => true,
        key: "identifier"
    },
    {
        tokenType: "Colon"
    },
    {
        role: "type",
        condition: () => true,
        key: "variableType"
    }
] as const);