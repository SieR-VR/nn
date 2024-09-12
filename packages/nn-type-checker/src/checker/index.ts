import { CallExpression, Declaration, isArgumentList, isCallExpression, isIdentifierExpression, travel, TypeNode } from "nn-language";
import { DeclarationScope, findValue, findSize } from "../resolver";
import { Vertex, Type } from "./types";

function toType(node: TypeNode | CallExpression, scope: DeclarationScope): Type {
  return {
    type: 'Tensor',
    shape: node.sizes.map(shape => {
      if (typeof shape === 'number') {
        return shape;
      }

      const size = findSize(scope, shape.value);
      return size;
    })
  }
}

export function checker(declaration: Declaration, scope: DeclarationScope) {
  const vertexList: Vertex[] = declaration
    .argumentList.args
    .map(arg => ({ expression: arg.ident, type: toType(arg.valueType, scope) }))

  const expressions = [
    ...travel(declaration, isCallExpression),
    ...travel(declaration, isIdentifierExpression),
  ];

  vertexList.push(...expressions.flatMap((expression): Vertex | Vertex[] => {
    if (isCallExpression(expression)) {
      if (expression.callee.value === 'Trainable') {
        return {
          expression,
          type: toType(expression, scope)
        }
      }
      
      return {
        expression,
        type: null
      }
    }

    if (isIdentifierExpression(expression)) {
      const value = findValue(scope, expression.ident.value);
      const vertex = vertexList.find(vertex => value.nodes.has(vertex.expression));

      if (vertex) {
        return {
          expression,
          type: vertex.type
        }
      }

      return {
        expression,
        type: null
      }
    }
  }))

  return vertexList;
} 
