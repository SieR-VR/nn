import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "sizeTypeParam", nodeType: "sizeTypeParam", priority: 0 }, [
    {
        tokenType: "LBracket",
        determinedBy: true,
    },
    {
        key: "params",
        composition: [
            {
                key: "sizeTypeList",
                composition: [
                    {
                        role: "sizeType",
                        condition: (p) => true,
                        key: "sizeType",
                    },
                    {
                        tokenType: "Comma",
                    }
                ],
                isRepeatable: true,
            },
            {
                key: "lastSizeType",
                role: "sizeType",
                condition: (p) => true,
            }
        ]
    },
    {
        tokenType: "RBracket",
    }
] as const);