import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "numericLiteral", nodeType: "numericLiteral", priority: 0 }, [
    {
        tokenType: "NumericLiteral",
    }
] as const);