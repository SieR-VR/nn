import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "expressionList", nodeType: "expressionList", priority: 0 }, [
    {
        tokenType: "LParen",
    },
    {
        key: "params",
        composition: [
            {
                key: "expressionList",
                composition: [
                    {
                        role: "expression",
                        condition: (p) => true,
                        key: "expression",
                    },
                    {
                        tokenType: "Comma",
                    }
                ],
                isRepeatable: true,
            },
            {
                key: "lastExpression",
                role: "expression",
                condition: (p) => true,
            }
        ]
    },
    {
        tokenType: "RParen",
    }
] as const);