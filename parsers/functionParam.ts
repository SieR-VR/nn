import { Ok, Err } from "ts-features";

import { Node } from "core/parser";
import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "functionParam", nodeType: "functionParam", priority: 0 }, [
    {
        tokenType: "LParen",
    },
    {
        key: "params",
        parseRule: (tokens, index, getRule, context) => {
            const parseType = getRule("variableWithType");
            const startPos = tokens[index].startPos;

            const nodes = [] as Node[];
            let nextIndex = index;
            let innerText = "";

            while (nextIndex < tokens.length) {
                const variableWithTypeNodeUnchecked = parseType(tokens, nextIndex, getRule, context);
                if (variableWithTypeNodeUnchecked.is_ok()) {
                    const [node, next] = variableWithTypeNodeUnchecked.unwrap();
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
                nodeType: "functionParams",
                role: "functionParams",
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