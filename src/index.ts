import { inspect } from "util";

import { SourceFile } from "nn-language";
import { TypeChecker } from "nn-type-checker";

const source = `
ConvBlock[Channel](x: Tensor[H, W, C]) =
  |> Conv2D[3, 1, 1, Channel]()
  |> BatchNorm()
  |> ReLU()
  |> Conv2D[3, 1, 1, Channel]()
  |> BatchNorm()
  |> ReLU()

UNetEncoder[Channel, Pool](x: Tensor[H, W, C]) =
  |> ConvBlock[Channel]()
  |> MaxPool[Pool]()

UNetDecoder[Channel](x: Tensor[H, W, C], skip: Tensor[H, W, C]) =
  x
  |> Conv2DTransposed[3, 1, 1, Channel]()
  |> Concat(skip)
  |> ConvBlock[Channel]()

UNet[Channel](x: Tensor[H, W, C]) =
  |> UNetEncoder[Channel]()
  |> UNetEncoder[Channel * 2]()
  |> UNetEncoder[Channel * 4]()
  |> UNetEncoder[Channel * 8]()
  
  |> ConvBlock[Channel * 8]()

  |> UNetDecoder[Channel * 8](s4)
  |> UNetDecoder[Channel * 4](s3)
  |> UNetDecoder[Channel * 2](s2)
  |> UNetDecoder[Channel](s1)
`

const result = SourceFile.parse(source, 'Linear.nn')
const context = TypeChecker.check(result)

console.log(inspect(
  context,
  { depth: 3 }
))
