import { Ok, Err } from "ts-features";

import { Node } from "infinite-lang/core/parser";
import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "functionTypeParam", nodeType: "functionTypeParam", priority: 0 }, [
    {
        tokenType: "LParen",
    },
    {
        key: "params",
        composition: [
            {
                key: "typeList",
                composition: [
                    {
                        role: "type",
                        condition: (p) => true,
                        key: "type",
                    },
                    {
                        tokenType: "Comma",
                    }
                ],
                isRepeatable: true,
            },
            {
                key: "lastType",
                role: "type",
                condition: (p) => true,
            }
        ]
    },
    {
        tokenType: "RParen",
    }
] as const);