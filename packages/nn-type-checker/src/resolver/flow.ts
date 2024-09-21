import { None, Option, Some } from "ts-features";
import { isCallExpression, travel } from "nn-language";

import { DeclarationScope, FileScope } from "./scope";
import { Diagnostic } from "..";

export interface Flow {
  calls: Set<Flow>;
  declaration: string;
}

export const defaultFlows: Record<string, Flow> = {
  "Trainable": { calls: new Set(), declaration: "Trainable" },
  "MatMul": { calls: new Set(), declaration: "MatMul" },
  "Bias": { calls: new Set(), declaration: "Bias" }
}

export function resolveFlows(scope: FileScope): Diagnostic[] {
  const errors: Diagnostic[] = [];
  const names = Object.values(scope.declarations).map(decl => decl.declaration);

  const resolveDeclScope = (declScope: DeclarationScope) =>
    travel(declScope.node, isCallExpression)
      .forEach(callExpression => {
        if (callExpression.callee.value === declScope.declaration) {
          errors.push({
            message: `Recursive call to '${declScope.declaration}'.`,
            node: callExpression.callee
          });
        } else if (callExpression.callee.value in scope.flows) {
          const callFlow = scope.flows[callExpression.callee.value];
          declScope.flow.calls.add(callFlow);
        } else if (!names.includes(callExpression.callee.value)) {
          errors.push({
            message: `Using undeclared flow name '${callExpression.callee.value}'.`,
            node: callExpression.callee
          });
        }
      });
  
  Object.values(scope.declarations)
    .forEach(resolveDeclScope);

  return errors;
}

export function findCircularFlow(flow: Flow): Option<Flow[]>  {
  const flows: Flow[] = [];

  const visit = (flow: Flow): boolean => {
    if (flows.includes(flow)) {
      return true;
    }

    flows.push(flow);

    for (const callFlow of flow.calls) {
      if (visit(callFlow)) {
        return true;
      }
    }

    flows.pop();

    return false;
  }

  if (visit(flow)) {
    return Some(flows);
  }

  return None();
}
