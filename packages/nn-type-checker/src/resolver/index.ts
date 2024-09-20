import { Declaration } from "nn-language";
import { Result, Ok, Err } from "ts-features";

import { DeclarationScope, FileScope, ResolveError } from "./types";
import { resolveValues } from "./value";
import { resolveSizes } from "./size";
import { defaultFlows, findCircularFlow, resolveFlows } from "./flow";

export function resolve(sourceCode: Declaration[], path: string): Result<FileScope, ResolveError[]> {
  const fileScope: FileScope = {
    path,
    declarations: {},
    flows: defaultFlows
  };

  sourceCode.forEach(decl => {
    const declScope: DeclarationScope = {
      file: fileScope,
      declaration: decl.name.value,

      node: decl,
      flow: { calls: new Set(), declaration: decl.name.value },
      sizes: {},
      values: {}
    };

    fileScope.declarations[decl.name.value] = declScope;
    fileScope.flows[decl.name.value] = declScope.flow;
  });

  const resolveValueErrors = 
    Object
      .values(fileScope.declarations)
      .flatMap(resolveValues);

  const resolveSizeErrors = 
    Object
      .values(fileScope.declarations)
      .flatMap(resolveSizes);

  const resolveFlowErrors = resolveFlows(fileScope);

  const duplicateErrors =
    Object
      .values(fileScope.declarations)
      .map(decl => decl.node.name)
      .filter((name, index, names) => names.indexOf(name) !== index)
      .map(name => ({
        message: `Duplicate function name '${name.value}'.`,
        node: name
      }));

  const checkErrors = 
    Object
      .values(fileScope.flows)
      .map((flow) => {
        const result = findCircularFlow(flow);

        if (result.is_some()) {
          const flows = result.unwrap();

          return {
            message: `Circular flow detected from '${flows.map(flow => flow.declaration).join(', ')}'.`,
            node: fileScope.declarations[flows[0].declaration].node
          } as ResolveError;
        }
      })
      .filter((error) => error !== undefined);

  const errors = [
    ...resolveValueErrors,
    ...resolveSizeErrors,
    ...resolveFlowErrors,
    ...duplicateErrors,
    ...checkErrors
  ];

  if (errors.length > 0) {
    return Err(errors);
  }

  return Ok(fileScope);
}

export * from './types'
export * from './value'
export * from './size'
export * from './flow'
