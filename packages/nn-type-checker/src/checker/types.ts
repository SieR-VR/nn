import { Node } from "nn-language";
import { Size } from "../resolver";

export interface Type {
  type: 'Tensor';
  shape: (Size | number)[];
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
