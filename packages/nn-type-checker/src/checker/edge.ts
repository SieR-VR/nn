import { CallExpression, isCallExpression, isStringLiteralExpression, isTupleExpression, travel } from "nn-language";
import { DeclarationScope, Flow, Size } from "../resolver";
import { TypeChecker, SizeType, Vertex, Type } from "..";
import { None, Option, Some } from "ts-features";

export interface Edge {
  args: Vertex[];
  sizeArgs: SizeType[];

  callee: Callee;
  toSolve: Vertex;

  passed?: boolean;
}

/**
 * internal
 */
interface Callee {
  sizes: Size[];
  args: Vertex[];
  return: Vertex;
  flow: Flow;
}

export namespace Edge {
  const _calleeMap = new Map<Flow, Callee>();

  function _getCallee(flow: Flow, context: TypeChecker): Callee {
    if (_calleeMap.has(flow)) {
      return _calleeMap.get(flow)!;
    }

    const callee = {
      sizes: flow.sizes,
      args: flow.args.map(arg => context.vertices.get(arg.first)!),
      return: context.vertices.get(flow.return!)!,
      flow,
    }

    _calleeMap.set(flow, callee);
    return callee;
  }

  export function make(scope: DeclarationScope, call: CallExpression, callee: Flow, context: TypeChecker, buffer?: Vertex[]): Edge {
    const args = call.args.filter(arg => !isStringLiteralExpression(arg));

    return {
      args: buffer
        ? [...buffer, ...args.map(arg => context.vertices.get(arg)!)]
        : args.map(arg => context.vertices.get(arg)!),

      sizeArgs: (call.sizes ?? []).map((size) => SizeType.from(size, scope)),
      callee: _getCallee(callee, context),
      toSolve: context.vertices.get(call)!,
    }
  }

  export function getAll(scope: DeclarationScope, edges: Edge[], context: TypeChecker): void {
    const { node: declaration } = scope;
    const visited = new Set<CallExpression>();

    let buffer: Vertex[] = declaration.firstPipe
      ? declaration.argumentList.args.map(arg => context.vertices.get(arg.ident)!)
      : []

    declaration.exprs.forEach((expr, index) => {
      const firstExpression = isTupleExpression(expr)
        ? expr.elements[0]
        : expr;

      const callNeeded =
        (index !== 0) || (index === 0 && declaration.firstPipe)

      if (!isCallExpression(firstExpression) && callNeeded) {
        context.diagnostics.push({
          message: 'First expression must be a function call if there is a pipe',
          node: firstExpression
        })

        return;
      }

      if (callNeeded) {
        const call = firstExpression as CallExpression;
        const callee = call.callee.value;

        if (!(callee in scope.file.flows)) {
          return;
        }

        const calleeFlow = scope.file.flows[callee];
        const edge = make(scope, call, calleeFlow, context, buffer);

        edges.push(edge);
        visited.add(call);
      }

      buffer = isTupleExpression(expr)
        ? expr.elements.map(ident => context.vertices.get(ident)!)
        : [context.vertices.get(expr)!]
    })

    travel(declaration.exprs, isCallExpression)
      .filter(call => !visited.has(call) && TypeChecker.getType(call, context).is_err())
      .forEach(call => {
        const callee = call.callee.value;
        if (!(callee in scope.file.flows)) {
          return;
        }

        const calleeFlow = scope.file.flows[callee];

        const edge = make(scope, call, calleeFlow, context);
        edges.push(edge);
      })
  }

  function convertType(edge: Edge, left: SizeType[], right: Size[], context: TypeChecker): Option<Type> {
    const indicesMap = right.reduce((prev, size, index) => {
      if (!prev.has(size)) {
        prev.set(size, []);
      }

      prev.get(size)!.push(index);
      return prev;
    }, new Map<Size, number[]>());

    const sizeDict = new Map<Size, SizeType>();
    left.forEach((size, index) => {
      const calleeSize = right[index];
      sizeDict.set(calleeSize, size);
    });

    let failed = false;
    indicesMap.forEach(indices => {
      const [first, ...rest] = indices;

      for (const index of rest) {
        if (!SizeType.isSame(left[first], left[index])) {
          context.diagnostics.push({
            message: `Size mismatch: ${SizeType.toString(left[first])} != ${SizeType.toString(left[index])}.`,
            node: edge.args[index].expression
          });

          failed = true;
        }
      }

      sizeDict.set(right[first], left[first]);
    });

    if (failed) {
      return None();
    }

    return Some(
      Type.convert(edge.callee.return.type.unwrap(), sizeDict)
    );
  }

  export function solve(edge: Edge, context: TypeChecker): void {
    if (typeof edge.passed === "boolean") return;
    if (edge.callee.return.type.is_none()) return;

    if (edge.callee.args.length !== edge.args.length) {
      context.diagnostics.push({
        message: `Expected ${edge.callee.args.length} arguments, but got ${edge.args.length}.`,
        node: edge.toSolve.expression
      });

      edge.passed = false; // unrecoverable
      return;
    }

    if ([...edge.args, ...edge.callee.args, edge.callee.return].some(vertex => vertex.type.is_none())) {
      return;
    }

    const [left, right] = (() => {
      if (edge.sizeArgs.length && edge.callee.sizes.length) {
        return [edge.sizeArgs, edge.callee.sizes];
      }

      return [[], []];
    })();

    let from: SizeType[] | undefined;

    if (edge.args.length && edge.callee.args.length) {
      const [firstLeftArg, ...restLeftArgs] = edge.args;
      const [firstRightArg, ...restRightArgs] = edge.callee.args;

      from = Type.isAssignable(firstLeftArg.type.unwrap(), firstRightArg.type.unwrap())
        .map_or_else(
          () => {
            context.diagnostics.push({
              message: `Cannot assign ${
                Type.toString(firstLeftArg.type.unwrap())
              } to ${
                Type.toString(firstRightArg.type.unwrap())
              }.`,
              node: firstLeftArg.expression
            });

            edge.passed = false; // unrecoverable
            return [];
          },
          ([from, [_left, _right]]) => {
            left.push(..._left);
            right.push(..._right);

            return from;
          }
        )

      Array.from<number>({ length: restLeftArgs.length })
        .reduce<[SizeType[], Size[]]>(([left, right], _, i) => {
          const leftArg = restLeftArgs[i];
          const rightArg = restRightArgs[i];

          return Type.isAssignableExact(leftArg.type.unwrap(), rightArg.type.unwrap())
            .map_or_else(
              () => {
                context.diagnostics.push({
                  message: `Cannot assign ${
                    Type.toString(leftArg.type.unwrap())
                  } to ${
                    Type.toString(rightArg.type.unwrap())
                  }.`,
                  node: leftArg.expression
                });

                edge.passed = false; // unrecoverable
                return [left, right];
              },
              ([_left, _right]) => {
                left.push(..._left);
                right.push(..._right);

                return [left, right];
              }
            )
        }, [left, right])
    }

    if (edge.passed === false) return;

    if (left.length === 0) {
      edge.passed = true;
      return;
    }

    const result = convertType(edge, left, right, context);
    if (result.is_some()) {
      const type = result.unwrap();
      edge.toSolve.type = from 
        ? Some(Type.concatShape(type, from))
        : Some(type);

      edge.passed = true;
    } else {
      edge.passed = false; // unrecoverable
    }
  }
}

