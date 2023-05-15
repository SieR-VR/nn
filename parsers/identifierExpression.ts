import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "expression", nodeType: "identifierExpression", priority: 0 }, [
    {
        role: "identifier",
        condition: () => true,
        key: "identifier",
    },
] as const);