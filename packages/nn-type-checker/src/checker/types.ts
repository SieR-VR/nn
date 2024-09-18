import { Node } from "nn-language";
import { Size } from "../resolver";

export interface Type {
  type: 'Tensor';
  shape: SizeType[];
}

export interface SizeType {
  type: 'Size';
  left: Size | SizeType | number;
  right?: SizeType;

  computeKind: 'pow' | 'mul' | 'add' | 'ident' | 'number';
}

export interface Vertex {
  expression: Node;
  type: Type | null;
}

export interface Edge {
  kind: 'Same' | 'Assign';
  from: Vertex;
  to: Vertex;
}

export interface TypeError {
  message: string;
  node: Node;
}
