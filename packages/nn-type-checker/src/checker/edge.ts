import { CallExpression, isCallExpression, isStringLiteralExpression, isTupleExpression, Node, SizeNode, travel } from "nn-language";
import { DeclarationScope, Flow, Size } from "../resolver";
import { Diagnostic, SizeType, Vertex } from "..";

export interface Edge {
  args: Vertex[];
  sizeArgs: SizeType[];

  callee: { sizes: Size[], args: Vertex[], return: Vertex, flow: Flow }
  toSolve: Vertex;

  passed?: boolean;
}

export function getEdges(scope: DeclarationScope, vertices: Map<Node, Vertex>, edges: Edge[], diagnostics: Diagnostic[]): void {
  const { node: declaration } = scope;
  const visited = new Set<CallExpression>();

  let buffer: Vertex[] = declaration.firstPipe
    ? declaration.argumentList.args.map(arg => vertices.get(arg.ident)!)
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

      if (!(callee in scope.file.flows)) {
        return;
      }

      const calleeFlow = scope.file.flows[callee];
      const args = call.args.filter(arg => !isStringLiteralExpression(arg));

      const edge: Edge = {
        args: [...buffer, ...args.map(arg => vertices.get(arg)!)],
        sizeArgs: (call.sizes ?? []).map((size) => SizeType.from(size, scope)),
        callee: {
          sizes: calleeFlow.sizes,
          args: calleeFlow.args.map(arg => vertices.get(arg.first)!),
          return: vertices.get(calleeFlow.return!)!,
          flow: calleeFlow,
        },
        toSolve: vertices.get(call)!,
      }

      edges.push(edge);
      visited.add(call);
    }

    buffer = isTupleExpression(expr)
      ? expr.elements.map(ident => vertices.get(ident)!)
      : [vertices.get(expr)!]
  })

  travel(declaration.exprs, isCallExpression)
    .filter(call => !visited.has(call))
    .forEach(call => {
      const callee = call.callee.value;
      if (!(callee in scope.file.flows)) {
        return;
      }

      const args = call.args.filter(arg => !isStringLiteralExpression(arg));
      const calleeFlow = scope.file.flows[callee];

      const edge: Edge = {
        args: args.map(arg => vertices.get(arg)!),
        sizeArgs: (call.sizes ?? []).map((size) => SizeType.from(size, scope)),
        callee: {
          sizes: calleeFlow.sizes,
          args: calleeFlow.args.map(arg => vertices.get(arg.first)!),
          return: vertices.get(calleeFlow.return!)!,
          flow: calleeFlow,
        },
        toSolve: vertices.get(call)!,
      }

      edges.push(edge);
    })
} 
