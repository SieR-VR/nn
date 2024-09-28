import { Declaration, Node } from 'nn-language';
import { checker, Type, Vertex } from './checker';
import { FileScope, Flow, resolve } from './resolver';

import { libs } from './lib';
import { Result, Ok, Err } from 'ts-features';

export * from './resolver'
export * from './checker'

export interface Diagnostic {
  message: string;
  node: Node;
}

export interface TypeChecker {
  path: string;

  scope: FileScope;

  globalFlows: Record<string, Flow>;
  vertices: Map<Node, Vertex>;

  diagnostics: Diagnostic[];
}

export namespace TypeChecker {

  /**
   * Check the syntax tree and return the type checker object
   * 
   * @param syntaxTree the target syntax tree to check
   * @param path the path of the file
   * @returns the type checker object
   */
  export function check(syntaxTree: Declaration[], path: string): TypeChecker {
    const context: Partial<TypeChecker> = { 
      path,
      
      globalFlows: libs.flows,
      vertices: libs.vertices,
      
      diagnostics: []
    }

    resolve(syntaxTree, path, context as TypeChecker);
    checker(context as TypeChecker);

    return context as TypeChecker;
  }

  export enum GetTypeError {
    NodeHasNoType = 'Node has no type',
    NodeIsNotVertex = 'Node is not a vertex',
  }
  
  /**
   * 
   * @param node the target node
   * @param checker the type checker object 
   * @returns Some if the node has a type, None 
   */
  export function getType(node: Node, checker: TypeChecker): Result<Type, GetTypeError> {
    return checker.vertices.has(node)
      ? checker.vertices.get(node)!.type
          .map_or_else(
            () => Err(GetTypeError.NodeHasNoType),
            (type) => Ok(type)
          )
      : Err(GetTypeError.NodeIsNotVertex)
  }
}
