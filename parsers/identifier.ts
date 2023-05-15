import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "identifier", nodeType: "identifier", priority: 0 }, [
    {
        tokenType: "Identifier",
    }
] as const);