import { Option, Some, None } from "ts-features";
import { isCallExpression, isIdentifierExpression, Node, travel } from "nn-language";

import { Type } from "./type";
import { DeclarationScope, Value } from "../resolver";

export interface Vertex {
  expression: Node;
  type: Option<Type>;
}

export namespace Vertex {

  /**
   * Creates a new vertex from an expression node.
   * 
   * @param expression expression node to create a vertex from
   * @param type (optional) type of the vertex
   * @returns a new vertex
   */
  export function from(expression: Node, type: Option<Type>): Vertex {
    return {
      expression, type
    };
  }

  /**
   * Gets all vertices from a given scope and adds them to the vertices map.
   * 
   * @param scope scope to get vertices from
   * @param vertices map to add vertices to
   */
  export function getAll(scope: DeclarationScope, vertices: Map<Node, Vertex>): void {
    const reducer = (acc: Map<Node, Vertex>, vertex: Vertex) => {
      acc.set(vertex.expression, vertex);
      return acc;
    }
  
    scope.node.argumentList.args
      .map(arg => Vertex.from(arg.ident, Some(Type.from(arg.valueType, scope))))
      .reduce(reducer, vertices);
  
    travel(scope.node, isIdentifierExpression)
      .map((expression): Vertex => {
        const value = Value.find(scope, expression.ident).unwrap();
        const vertex = Array.from(value.nodes.values()).find(node => vertices.has(node));
  
        return {
          expression,
          type: vertex
            ? vertices.get(vertex)!.type
            : None()
        };
      })
      .forEach(vertex => {
        vertices.set(vertex.expression, vertex);
      });
  
    travel(scope.node, isCallExpression)
      .forEach(expression =>
        vertices.set(expression, {
          expression,
          type: None()
        })
      );
  }
}

