import { Ok, Err } from "ts-features";

import { Node } from "infinite-lang/core/parser";
import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "expressionList", nodeType: "expressionList", priority: 0 }, [
    {
        tokenType: "LParen",
    },
    {
        key: "params",
        parseRule: (tokens, index, getRule, context) => {
            const parseType = getRule("expression");
            const startPos = tokens[index].startPos;

            const nodes = [] as Node[];
            let nextIndex = index;
            let innerText = "";

            while (nextIndex < tokens.length) {
                const expressionNodeUnchecked = parseType(tokens, nextIndex, getRule, context);
                if (expressionNodeUnchecked.is_ok()) {
                    const [node, next] = expressionNodeUnchecked.unwrap();
                    nodes.push(node);
                    innerText += node.innerText;
                    nextIndex = next;

                    if (tokens[nextIndex].tokenType === "Comma") {
                        nextIndex += 1;
                        innerText += ", ";
                        continue;
                    }

                    break;
                }

                break;
            }

            return Ok([{
                nodeType: "expressionLists",
                role: "expressionLists",
                children: nodes,
                innerText,
                startPos,
                endPos: tokens[nextIndex].endPos,
            }, nextIndex])
        }
    },
    {
        tokenType: "RParen",
    }
] as const);