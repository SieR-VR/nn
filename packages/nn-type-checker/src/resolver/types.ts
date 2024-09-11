import type { Node } from "nn-language";

export interface FileScope {
	path: string;
	declarations: DeclarationScope[];
}

export interface DeclarationScope {
	file: FileScope;
	declaration: string;

	sizes: Size[];
	values: Value[];
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
