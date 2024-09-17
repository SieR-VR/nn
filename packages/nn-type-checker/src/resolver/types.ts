import type { Node } from "nn-language";

export interface FileScope {
  path: string;
  declarations: Record<string, DeclarationScope>;
  flows: Record<string, Flow>;
}

export interface DeclarationScope {
  file: FileScope;
  declaration: string;

  flow: Flow;
  node: Node;
  sizes: Record<string, Size>;
  values: Record<string, Value>;
}

export interface Flow {
  calls: Set<Flow>;
  declaration: string;
}

export interface Size {
  scope: DeclarationScope;
  ident: string;

  nodes: Set<Node>;
}

export interface Value {
  scope: DeclarationScope;
  ident: string;

  nodes: Set<Node>;
}

export interface ResolveError {
  message: string;
  node: Node;
}
