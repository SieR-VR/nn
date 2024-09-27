import { CallExpression, isCallExpression, isStringLiteralExpression, isTupleExpression, travel } from "nn-language";
import { DeclarationScope, Flow, Size } from "../resolver";
import { CheckerContext, SizeType, Vertex } from "..";

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

  function _getCallee(flow: Flow, context: CheckerContext): Callee {
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

  export function make(scope: DeclarationScope, call: CallExpression, callee: Flow, context: CheckerContext, buffer?: Vertex[]): Edge {
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

  export function getAll(scope: DeclarationScope, edges: Edge[], context: CheckerContext): void {
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
      .filter(call => !visited.has(call))
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
}

