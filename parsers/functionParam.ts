import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "functionParam", nodeType: "functionParam", priority: 0 }, [
    {
        tokenType: "LParen",
    },
    {
        key: "params",
        composition: [
            {
                key: "variableList",
                composition: [
                    {
                        role: "variableWithType",
                        condition: (p) => true,
                        key: "variable",
                    },
                    {
                        tokenType: "Comma",
                    }
                ],
                isRepeatable: true,
            },
            {
                key: "lastVariable",
                role: "variableWithType",
                condition: (p) => true,
            }
        ]
    },
    {
        tokenType: "RParen",
    }
] as const);