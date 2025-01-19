import { Declaration, isCallExpression, travel } from "nn-language";
import { Type, TypeChecker, Polynomial, Flow } from "nn-type-checker";

export interface AnalyzerTarget {
  declaration: string;
}

export interface AnalyzerSettings {
  sizeMap: Record<string, number>;
}

export function analyze(
  checker: TypeChecker,
  target: AnalyzerTarget,
  settings: AnalyzerSettings
) {
  const flow = checker.scope.flows[target.declaration];

  const polynomial = getPolynomialForFlow(checker, flow, settings);
  return Polynomial.inspect(polynomial);
}

function getPolynomialForFlow(
  checker: TypeChecker,
  flow: Flow,
  settings: AnalyzerSettings
) {
  const calls = travel(flow.declaration.node, isCallExpression);

  const result = calls.reduce((prev, call) => {
    const calleeName = call.callee.value;

    if (calleeName === "Trainable") {
      const type = TypeChecker
        .getType(call, checker)
        .unwrap();

      const product = type.shape.reduce(
        (prev, curr) => Polynomial.mul(prev, Polynomial.from(curr)),
        Polynomial.constant(1)
      );

      return Polynomial.add(prev, product);
    }
    
    return prev;
  }, Polynomial.constant(0));

  return result;
}
