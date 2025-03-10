import { onnx } from "onnx-proto";

import { SourceFile } from "nn-language";
import { TypeChecker } from "nn-type-checker";

import { declaration } from "./node";

export interface OnnxSettings {
  version: "0.1" | string;
  target: string;
}

export function codegen(
  source: SourceFile,
  checker: TypeChecker,
  settings: OnnxSettings
): Uint8Array {
  const functions = source.tree.map((t) =>
    declaration(t, {
      checker,
      _nextTemporaryIndex: 0,
      temporaryNameRecord: new Map(),
    })
  );

  const target = functions.find((f) => f.name === settings.target)!;

  const modelProto = new onnx.ModelProto({
    functions,
    graph: new onnx.GraphProto({
      input: target.input.map(
        (i) =>
          new onnx.ValueInfoProto({
            name: i,
          })
      ),
      output: target.output.map(
        (o) =>
          new onnx.ValueInfoProto({
            name: o,
          })
      ),
      node: target.node,
      initializer: [],
    }),
  });

  return onnx.ModelProto.encode(modelProto).finish();
}
