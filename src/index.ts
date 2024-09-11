import { parse } from "nn-language";
import { resolveNames } from "nn-type-checker/src/resolver";
import { inspect } from "util";

const source = `
Linear[input, output](x: Tensor[input]) = 
  x, Trainable[input, output]('weight')
  |> MatMul(), Trainable[output]('bias')
  |> Bias()
`

const result = parse(source)
const declarations = result.unwrap()

const scope = resolveNames(declarations, "src/Linear.nn")
console.log(inspect(scope, { depth: null }))
