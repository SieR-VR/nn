import { Ok, Err } from "ts-features";

import { Node } from "infinite-lang/core/parser";
import { makeParseRuleModule } from "infinite-lang/rule/parser";

export default makeParseRuleModule({ role: "sizeTypeParam", nodeType: "sizeTypeParam", priority: 0 }, [
    {
        tokenType: "LBracket",
        determinedBy: true,
    },
    {
        key: "params",
        parseRule: (tokens, index, getRule, context) => {
            const parseNumericLiteral = getRule("numericLiteral");
            const parseIdentifier = getRule("identifier");
            
            const startPos = tokens[index].startPos;

            const nodes = [] as Node[];
            let nextIndex = index;
            let innerText = "";

            while (nextIndex < tokens.length) {
                const numericLiteralNodeUnchecked = parseNumericLiteral(tokens, nextIndex, getRule, context);
                if (numericLiteralNodeUnchecked.is_ok()) {
                    const [node, next] = numericLiteralNodeUnchecked.unwrap();
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

                const identifierNodeUnchecked = parseIdentifier(tokens, nextIndex, getRule, context);
                if (identifierNodeUnchecked.is_ok()) {
                    const [node, next] = identifierNodeUnchecked.unwrap();
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
                nodeType: "sizeTypeParam",
                role: "sizeTypeParam",
                children: nodes,
                innerText,
                startPos,
                endPos: tokens[nextIndex].endPos,
            }, nextIndex])
        }
    },
    {
        tokenType: "RBracket",
    }
] as const);