import { Node } from "nn-language";
import { FileScope, Size } from "../resolver";

import { Diagnostic } from "..";
import { getVertices, Vertex } from "./vertex";
import { Edge, getEdges } from "./edge";

import { Type } from "./type";
import { SizeType } from "./sizetype";

export function checker(scope: FileScope, vertices: Map<Node, Vertex>): { vertices: Map<Node, Vertex>, diagnostics: Diagnostic[] } {
  const diagnostics: Diagnostic[] = [];
  const edges: Edge[] = [];

  Object.values(scope.declarations)
    .forEach(decl => getVertices(decl, vertices))

  Object.values(scope.declarations)
    .forEach(decl => getEdges(decl, vertices, edges, diagnostics))

  let passedCount = 0, lastPassedCount = -1;

  while (passedCount < edges.length && passedCount !== lastPassedCount) {
    edges.forEach(edge => {
      if (typeof edge.passed === "boolean") return;
      if (!edge.callee.return.type) return;
      
      if (edge.callee.args.length !== edge.args.length) {
        diagnostics.push({
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

        if (!arg.type || !flowArg.type) {
          continue;
        }

        const result = Type.isAssignable(arg.type, flowArg.type);

        if (typeof result === 'boolean') {
          if (!result) {
            diagnostics.push({
              message: `Cannot assign ${Type.toString(arg.type)} to ${Type.toString(flowArg.type)}.`,
              node: arg.expression
            });

            edge.passed = false;
          }

          continue;
        }

        result.forEach(([a, b]) => {
          left.push(a);
          right.push(b);
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
            diagnostics.push({
              message: `Size mismatch: ${SizeType.toString(left[first])} != ${SizeType.toString(left[index])}.`,
              node: edge.toSolve.expression
            });

            edge.passed = false;
          }
        }

        sizeDict.set(right[first], left[first]);
      });

      edge.passed = true;
      edge.toSolve.type = Type.convert(edge.callee.return.type, sizeDict)
    })

    lastPassedCount = passedCount;
    passedCount = edges.filter(edge => edge.passed === true).length;
  }

  return { vertices: vertices, diagnostics };
}

export * from './vertex';
export * from './type';
export * from './sizetype';
