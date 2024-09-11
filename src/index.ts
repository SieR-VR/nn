import { parse } from "nn-language";

const source = `
Linear(x: Tensor) = 
  x, Trainable('weight')
  |> MatMul(), Trainable('bias')
  |> Bias()
`

const result = parse(source)
console.log(JSON.stringify(result.unwrap(), null, 2))
