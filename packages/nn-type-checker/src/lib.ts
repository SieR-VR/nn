import { Identifier, Node } from "nn-language";
import { DeclarationScope, Flow, Size, Value } from "./resolver";
import { SizeType, Type, Vertex } from "./checker";
import { Some } from "ts-features";

export const libs = (() => {
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
        prev[s] = Size.make(scope, fakeIdent(`${declaration}_${s}`))
        return prev;
      },
      {} as Record<string, Size>
    );
    const values = arg.map((_, i) => Value.make(scope, fakeIdent(`${declaration}_arg${i}`)));
    const resultValue = fakeIdent(`${declaration}_result`);

    const toSizeType = (s: string): SizeType => ({ computeKind: "ident", left: sizes[s] });
    const toType = (sList: string[]): Type => ({ type: "Tensor", shape: sList.map(toSizeType) });

    const toVertex = (v: Node, sList: string[]): Vertex => ({ expression: v, type: Some(toType(sList)) });

    return {
      flow: {
        calls: new Set(),
        declaration: scope,

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
  const matmul = fake("MatMul", ["input", "output"], [["input"], ["input", "output"]], ["output"]);
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
