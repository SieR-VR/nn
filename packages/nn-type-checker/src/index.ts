import { Declaration, Identifier, Node } from 'nn-language';
import { checker, SizeType, Type, Vertex } from './checker';
import { DeclarationScope, FileScope, Flow, resolve, Size, toSize, toValue, Value } from './resolver';

export * from './resolver'
export * from './checker'

export interface Diagnostic {
  message: string;
  node: Node;
}

export interface CheckerContext {
  path: string;

  scope: FileScope;
  vertices: Map<Node, Vertex>;

  diagnostics: Diagnostic[];
}

export const defaults = (() => {
  const fakeScope = (declaration: string) => ({
    declaration
  } as DeclarationScope);
  const fakeIdent = (value: string) => ({
    value
  } as Identifier);

  const fake = (declaration: string, size: string[], arg: string[][], result: string[]) => {
    const scope = fakeScope(declaration);
    
    const sizes = size.reduce(
      (prev, s) => {
        prev[s] = toSize(scope, fakeIdent(`${declaration}_${s}`))
        return prev;
      },
      {} as Record<string, Size>
    );
    const values = arg.map((_, i) => toValue(scope, fakeIdent(`${declaration}_arg${i}`)));
    const resultValue = fakeIdent(`${declaration}_result`);

    const toSizeType = (s: string): SizeType => ({ computeKind: "ident", left: sizes[s] });
    const toType = (sList: string[]): Type => ({ type: "Tensor", shape: sList.map(toSizeType) });

    const toVertex = (v: Node, sList: string[]): Vertex => ({ expression: v, type: toType(sList) });

    return {
      flow: {
        scope,
        calls: new Set(),
        declaration,

        sizes: Object.values(sizes),
        args: values,
        return: resultValue
      } as Flow,
      vertices: [
        ...values.map((v, i) => [v.first, toVertex(v.first, arg[i])]),
        [resultValue, toVertex(resultValue, result)]
      ] as [Node, Vertex][]
    }
  }

  const trainable = fake("Trainable", ["input"], [], ["input"]);
  const matmul = fake("MatMul", ["input", "output"], [["input"], ["output"]], ["output"]);
  const bias = fake("Bias", ["output"], [["output"], ["output"]], ["output"]);

  return {
    flows: {
      "Trainable": trainable.flow,
      "MatMul": matmul.flow,
      "Bias": bias.flow
    } as Record<string, Flow>,
    vertices: new Map<Node, Vertex>([
      ...trainable.vertices,
      ...matmul.vertices,
      ...bias.vertices
    ])
  }
})();

export function check(syntaxTree: Declaration[], path: string): CheckerContext {
  const ctx: Partial<CheckerContext> = { path }

  const resolverResult = resolve(syntaxTree, defaults.flows, path);
  if (resolverResult.is_err()) {
    const diagnostics = resolverResult.unwrap_err();
    return { ...ctx, diagnostics } as CheckerContext;
  }

  const scope = resolverResult.unwrap();
  ctx.scope = scope;

  const { vertices, diagnostics } = checker(scope, defaults.vertices);
  return { ...ctx, vertices, diagnostics } as CheckerContext;
}
