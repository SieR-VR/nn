import { match_string, Result, Ok, Err } from "ts-features";

import { CallExpression, Declaration, Expression, Identifier, isCallExpression, isIdentifierExpression, isTupleExpression, travel, TypeNode } from "nn-language";
import { DeclarationScope, findValue, findSize } from "../resolver";
import { Vertex, Type, TypeError } from "./types";

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

export function checker(declaration: Declaration, scope: DeclarationScope): Result<Vertex[], [Vertex[], TypeError[]]> {
  const diagnostics: TypeError[] = [];

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

  let buffer: (Expression | Identifier)[] = declaration.firstPipe
    ? declaration.argumentList.args.map(arg => arg.ident)
    : []

  declaration.exprs.forEach((expr, index) => {
    const firstExpression = (() => {
      if (isTupleExpression(expr)) {
        return expr.elements[0]
      }

      return expr
    })();

    const callNeeded = (index !== 0) || (index === 0 && declaration.firstPipe)
    if (!isCallExpression(firstExpression) && callNeeded) {
      diagnostics.push({
        message: 'First expression must be a function call if there is a pipe',
        node: firstExpression
      })

      return;
    }

    if (callNeeded) {
      const call = firstExpression as CallExpression;
      const callee = call.callee.value;

      const type = match_string<Type | undefined, string>(callee, {
        'MatMul': () => {
          const args = [...buffer, ...call.args];

          if (args.length !== 2) {
            diagnostics.push({
              message: 'MatMul requires 2 arguments',
              node: call
            })
          }

          args.forEach((arg, index) => {
            const vertex = vertexList.find(vertex => vertex.expression === arg);

            if (!vertex || vertex.type === null) {
              diagnostics.push({
                message: `Argument ${index + 1} type is unknown`,
                node: arg
              })
            }
          })

          const [left, right] = args.map(arg => vertexList.find(vertex => vertex.expression === arg).type)

          if (right.shape.length !== 2) {
            diagnostics.push({
              message: 'MatMul requires a 2D tensor as the second argument',
              node: call
            })
          }

          if (left.shape.at(-1) !== right.shape.at(0)) {
            diagnostics.push({
              message: 'MatMul requires the last dimension of the first argument to match the first dimension of the second argument',
              node: call
            })
          }

          return {
            type: 'Tensor',
            shape: [...left.shape.slice(-1), right.shape.at(1)]
          }
        },
        'Bias': () => {
          const args = [...buffer, ...call.args];

          if (args.length !== 2) {
            diagnostics.push({
              message: 'Bias requires 2 arguments',
              node: call
            })
          }

          args.forEach((arg, index) => {
            const vertex = vertexList.find(vertex => vertex.expression === arg);

            if (!vertex || vertex.type === null) {
              diagnostics.push({
                message: `Argument ${index + 1} type is unknown`,
                node: arg
              })
            }
          })

          const [left, right] = args.map(arg => vertexList.find(vertex => vertex.expression === arg).type)
          if (right.shape.length !== 1) {
            diagnostics.push({
              message: 'Bias requires a 1D tensor as the second argument',
              node: call
            })
          }

          if (left.shape.at(-1) !== right.shape.at(0)) {
            diagnostics.push({
              message: 'Bias requires the last dimension of the first argument to match the first dimension of the second argument',
              node: call
            })
          }

          return {
            type: 'Tensor',
            shape: left.shape
          }
        }
      })

      if (type) {
        const vertex = vertexList.find(vertex => vertex.expression === call);
        vertex.type = type;
      }
    }

    buffer = isTupleExpression(expr)
      ? expr.elements
      : [expr]
  })

  if (diagnostics.length === 0) {
    return Ok(vertexList);
  }

  return Err([vertexList, diagnostics]);
}

export * from './types';
