import { Declaration, Node } from 'nn-language';
import { checker, Vertex } from './checker';
import { FileScope, Flow, resolve } from './resolver';

import { libs } from './lib';

export * from './resolver'
export * from './checker'

export interface Diagnostic {
  message: string;
  node: Node;
}

export interface CheckerContext {
  path: string;

  scope: FileScope;

  globalFlows: Record<string, Flow>;
  vertices: Map<Node, Vertex>;

  diagnostics: Diagnostic[];
}

export function check(syntaxTree: Declaration[], path: string): CheckerContext {
  const context: Partial<CheckerContext> = { 
    path,
    
    globalFlows: libs.flows,
    vertices: libs.vertices,
    
    diagnostics: []
  }

  resolve(syntaxTree, path, context as CheckerContext);
  checker(context as CheckerContext);

  return context as CheckerContext;
}
