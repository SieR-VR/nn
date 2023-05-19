import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "sizeType", nodeType: "numberSizeType", priority: 0 }, [
    {
        role: "numericLiteral",
        condition: (p) => true,
        key: "literal",
    }
] as const);