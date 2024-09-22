import { isCallExpression, isIdentifierExpression, Node, travel } from "nn-language";
import { Type } from "./type";
import { DeclarationScope, findValue } from "../resolver";

export interface Vertex {
  expression: Node;
  type: Type | null;
}

export function getVertices(scope: DeclarationScope, map?: Map<Node, Vertex>): void {
  const reducer = (acc: Map<Node, Vertex>, vertex: Vertex) => {
    acc.set(vertex.expression, vertex);
    return acc;
  }

  const vertices: Map<Node, Vertex> = scope.node.argumentList.args
    .map(arg => ({ expression: arg.ident, type: Type.from(arg.valueType, scope) }))
    .reduce(reducer, map ?? new Map<Node, Vertex>());

  travel(scope.node, isIdentifierExpression)
    .map((expression): Vertex => {
      const value = findValue(scope, expression.ident)!;
      const vertex = Array.from(value.nodes.values()).find(node => vertices.has(node));

      if (vertex) {
        return {
          expression,
          type: vertices.get(vertex)!.type
        }
      }

      return {
        expression,
        type: null
      }
    })
    .forEach(vertex => {
      vertices.set(vertex.expression, vertex);
    });

  travel(scope.node, isCallExpression)
    .map((expression): Vertex => {
      if (expression.callee.value === 'Trainable') {
        return {
          expression,
          type: Type.from(expression, scope)
        }
      }

      return {
        expression,
        type: null
      }
    })
    .forEach(vertex => {
      vertices.set(vertex.expression, vertex);
    });
}
