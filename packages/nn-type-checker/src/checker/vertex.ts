import { Node } from "nn-language";
import { Type } from "./type";

export interface Vertex {
  expression: Node;
  type: Type | null;
}
