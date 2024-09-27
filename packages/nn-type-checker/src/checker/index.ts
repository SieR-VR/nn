import { Some } from "ts-features";
import { Size } from "../resolver";

import { CheckerContext } from "..";
import { Vertex } from "./vertex";
import { Edge } from "./edge";

import { Type } from "./type";
import { SizeType } from "./sizetype";

export function checker(context: CheckerContext) {
  const edges: Edge[] = [];

  Object.values(context.scope.declarations)
    .forEach(decl => Vertex.getAll(decl, context.vertices))

  Object.values(context.scope.declarations)
    .forEach(decl => Edge.getAll(decl, edges, context))

  let passedCount = 0, lastPassedCount = -1;

  while (passedCount < edges.length && passedCount !== lastPassedCount) {
    edges.forEach(edge => {
      if (typeof edge.passed === "boolean") return;
      if (edge.callee.return.type.is_none()) return;
      
      if (edge.callee.args.length !== edge.args.length) {
        context.diagnostics.push({
          message: `Expected ${edge.callee.args.length} arguments, but got ${edge.args.length}.`,
          node: edge.toSolve.expression
        });

        edge.passed = false;
        return;
      }

      const left: SizeType[] = [], right: Size[] = [];

      for (let i = 0; i < edge.callee.args.length; i++) {
        const arg = edge.args[i];
        const flowArg = edge.callee.args[i];

        if (arg.type.is_none() || flowArg.type.is_none()) {
          continue;
        }

        const leftArg = arg.type.unwrap();
        const rightArg = flowArg.type.unwrap();

        const result = Type.isAssignable(leftArg, rightArg);

        if (typeof result === 'boolean') {
          if (!result) {
            context.diagnostics.push({
              message: `Cannot assign ${Type.toString(leftArg)} to ${Type.toString(rightArg)}.`,
              node: arg.expression
            });

            edge.passed = false;
          }

          continue;
        }

        result.forEach(([leftArg, rightArg]) => {
          left.push(leftArg);
          right.push(rightArg);
        });
      }

      const map = new Map<Size, number[]>();

      right.forEach((size, index) => {
        if (!map.has(size)) {
          map.set(size, []);
        }

        map.get(size)!.push(index);
      });

      const sizeDict = new Map<Size, SizeType>();
      edge.sizeArgs.forEach((size, index) => {
        const calleeSize = edge.callee.sizes[index];
        sizeDict.set(calleeSize, size);
      });

      [...map.values()].forEach(indices => {
        const [first, ...rest] = indices;

        for (const index of rest) {
          if (!SizeType.isSame(left[first], left[index])) {
            context.diagnostics.push({
              message: `Size mismatch: ${SizeType.toString(left[first])} != ${SizeType.toString(left[index])}.`,
              node: edge.toSolve.expression
            });

            edge.passed = false;
          }
        }

        sizeDict.set(right[first], left[first]);
      });

      edge.passed = true;
      edge.toSolve.type = Some(
        Type.convert(
          edge.callee.return.type.unwrap(), 
          sizeDict
        )
      )
    })

    lastPassedCount = passedCount;
    passedCount = edges.filter(edge => edge.passed === true).length;
  }
}

export * from './vertex';
export * from './type';
export * from './sizetype';
