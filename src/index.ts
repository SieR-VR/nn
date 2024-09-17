import { inspect } from "util";

import { parse } from "nn-language";
import { check } from "nn-type-checker";

const source = `
Linear[input, output](x: Tensor[input]) = 
  x, Trainable[input, output]('weight')
  |> MatMul(), Trainable[output]('bias')
  |> Bias()

Circular1[input, output](x: Tensor[input]) =
  Circular2[input, output](x)

Circular2[input, output](x: Tensor[input]) =
  Circular3[input, output](x)

Circular3[input, output](x: Tensor[input]) =
  Circular1[input, output](x)
`

const result = parse(source)
const declarations = result.unwrap()

const context = check(declarations, "src/Linear.nn")

console.log(inspect(context, { depth: 3 }))
