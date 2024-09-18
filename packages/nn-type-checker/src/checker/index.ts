import { match_string, Result, Ok, Err } from "ts-features";

import { CallExpression, Declaration, Expression, Identifier, isCallExpression, isIdentifierExpression, isTupleExpression, Node, SizeNode, travel, TypeNode } from "nn-language";
import { DeclarationScope, findValue, findSize } from "../resolver";
import { Vertex, Type, TypeError, SizeType } from "./types";

function toSizeType(node: SizeNode, scope: DeclarationScope): SizeType {
  return match_string<SizeType, SizeNode["sizeType"]>(node.sizeType, {
    add: () => ({
      left: toSizeType(node.left!, scope),
      right: toSizeType(node.right!, scope),

      computeKind: 'add',
      type: 'Size',
    }),
    mul: () => ({
      left: toSizeType(node.left!, scope),
      right: toSizeType(node.right!, scope),

      computeKind: 'mul',
      type: 'Size',
    }),
    pow: () => ({
      left: toSizeType(node.left!, scope),
      right: toSizeType(node.right!, scope),

      computeKind: 'pow',
      type: 'Size',
    }),
    ident: () => ({
      left: findSize(scope, node.ident!)!,
      computeKind: 'ident',
      type: 'Size',
    }),
    number: () => ({
      left: node.number!,
      computeKind: 'number',
      type: 'Size',
    })
  })
}

function isSizeTypeSame(left: SizeType, right: SizeType): boolean {
  if (left.computeKind !== right.computeKind) {
    return false;
  }

  switch (left.computeKind) {
    case 'add':
    case 'mul':
    case 'pow':
      return isSizeTypeSame(left.left as SizeType, right.left as SizeType) && isSizeTypeSame(left.right as SizeType, right.right as SizeType);
    case 'ident':
      return left.left === right.left;
    case 'number':
      return left.left === right.left;
  }
}

function toType(node: TypeNode | CallExpression, scope: DeclarationScope): Type {
  return {
    type: 'Tensor',
    shape: node.sizes 
      ? node.sizes.map(size => toSizeType(size, scope))
      : []
  }
}

export function checker(declaration: Declaration, scope: DeclarationScope): Result<Map<Node, Vertex>, [Map<Node, Vertex>, TypeError[]]> {
  const diagnostics: TypeError[] = [];

  const vertexList: Map<Node, Vertex> = declaration
    .argumentList.args
    .map(arg => ({ expression: arg.ident, type: toType(arg.valueType, scope) }))
    .reduce((acc, vertex) => {
      acc.set(vertex.expression, vertex);
      return acc;
    }, new Map<Node, Vertex>());


  travel(declaration, isIdentifierExpression)
    .map((expression): Vertex => {
      const value = findValue(scope, expression.ident)!;
      const vertex = Array.from(value.nodes.values()).find(node => vertexList.has(node));

      if (vertex) {
        return {
          expression,
          type: vertexList.get(vertex)!.type
        }
      }

      return {
        expression,
        type: null
      }
    })
    .forEach(vertex => {
      vertexList.set(vertex.expression, vertex);
    });

  travel(declaration, isCallExpression)
    .map((expression): Vertex => {
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
    })
    .forEach(vertex => {
      vertexList.set(vertex.expression, vertex);
    });

  let buffer: (Expression | Identifier)[] = declaration.firstPipe
    ? declaration.argumentList.args.map(arg => arg.ident)
    : []

  declaration.exprs.forEach((expr, index) => {
    const firstExpression = isTupleExpression(expr)
      ? expr.elements[0]
      : expr;

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

            return;
          }

          for (const arg of args) {
            const vertex = vertexList.get(arg);

            if (!vertex || vertex.type === null) {
              diagnostics.push({
                message: `Argument ${index + 1} type is unknown`,
                node: arg
              })

              return;
            }
          }

          const [left, right] = args.map(arg => vertexList.get(arg)!.type!)

          if (right.shape!.length !== 2) {
            diagnostics.push({
              message: 'MatMul requires a 2D tensor as the second argument',
              node: call
            })
          }

          if (!isSizeTypeSame(left.shape.at(-1)!, right.shape.at(0)!)) {
            diagnostics.push({
              message: 'MatMul requires the last dimension of the first argument to match the first dimension of the second argument',
              node: call
            })
          }

          return {
            type: 'Tensor',
            shape: [...left.shape.slice(-1)!, right.shape.at(1)!]
          }
        },
        'Bias': () => {
          const args = [...buffer, ...call.args];

          if (args.length !== 2) {
            diagnostics.push({
              message: 'Bias requires 2 arguments',
              node: call
            })

            return;
          }

          for (const arg of args) {
            const vertex = vertexList.get(arg);

            if (!vertex || vertex.type === null) {
              diagnostics.push({
                message: `Argument ${index + 1} type is unknown`,
                node: arg
              })

              return;
            }
          }

          const [left, right] = args.map(arg => vertexList.get(arg)!.type!)

          if (right.shape.length !== 1) {
            diagnostics.push({
              message: 'Bias requires a 1D tensor as the second argument',
              node: call
            })
          }

          if (!isSizeTypeSame(left.shape.at(-1)!, right.shape.at(0)!)) {
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
        const vertex = vertexList.get(call)!;
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
