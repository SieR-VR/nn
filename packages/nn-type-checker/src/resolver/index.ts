import { Declaration } from "nn-language";

import { Scope } from "./scope";
import { Value, Size, Flow, CheckerContext } from "..";

/**
 * Resolves the names in the syntax tree.
 * 
 * @param source the syntax tree to resolve names
 * @param path the path of the file
 * @param context the context of the checker
 */
export function resolve(source: Declaration[], path: string, context: CheckerContext): void {
  context.scope = Scope.makeFile(path);
  context.scope.flows = { ...context.globalFlows };

  source.forEach(decl => {
    const scope = Scope.makeDeclaration(context.scope, decl);
    const flow = Flow.make(scope);

    context.scope.declarations[decl.name.value] = scope;
    context.scope.flows[decl.name.value] = flow;
  });

  Object
    .values(context.scope.declarations)
    .flatMap((scope) => Value.resolve(scope, context.diagnostics));

  Object
    .values(context.scope.declarations)
    .flatMap((scope) => Size.resolve(scope, context.diagnostics));

  Flow.resolve(context.scope, context.diagnostics);

  Object
    .values(context.scope.declarations)
    .map(decl => decl.node.name)
    .filter((name, index, names) => names.indexOf(name) !== index)
    .forEach(name => context.diagnostics.push({
      message: `Duplicate function name '${name.value}'.`,
      node: name
    }));

  Object
    .values(context.scope.flows)
    .map((flow) => {
      const result = Flow.findCircular(flow);

      if (result.is_some()) {
        const flows = result.unwrap();

        context.diagnostics.push({
          message: `Circular flow detected from '${flows.map(flow => flow.declaration).join(', ')}'.`,
          node: flows[0].declaration.node
        });
      }
    });
}

export * from './scope'
export * from './value'
export * from './size'
export * from './flow'
