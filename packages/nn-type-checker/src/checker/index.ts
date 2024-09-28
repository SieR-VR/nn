import { Vertex } from "./vertex";
import { Edge } from "./edge";

import { TypeChecker } from "..";

export function checker(context: TypeChecker) {
  const edges: Edge[] = [];

  Object.values(context.scope.declarations)
    .forEach(decl => Vertex.getAll(decl, context.vertices))

  Object.values(context.scope.declarations)
    .forEach(decl => Edge.getAll(decl, edges, context))

  let passedCount = 0, lastPassedCount = -1;

  while (passedCount < edges.length && passedCount !== lastPassedCount) {
    edges.forEach((edge) => Edge.solve(edge, context));

    lastPassedCount = passedCount;
    passedCount = edges.filter(edge => edge.passed === true).length;
  }
}

export * from './vertex';
export * from './type';
export * from './sizetype';
