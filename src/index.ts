import { inspect } from "util";

import { SourceFile } from "nn-language";
import { TypeChecker } from "nn-type-checker";

const source = `
Conv2D[
  Kernel, 
  Padding, 
  Stride, 
  Channel
](
  x: Tensor[H, W, C]
): Tensor[
  (H + (2 * Padding) - Kernel) / Stride + 1,
  (W + (2 * Padding) - Kernel) / Stride + 1,
  Channel 
]

MaxPool[Pool](x: Tensor[H, W, C]): Tensor[H / Pool, W / Pool, C]

Conv2DTransposed[
  Kernel,
  Padding,
  Stride,
  Pool,
  Channel
](
  x: Tensor[H, W, C]
): Tensor[
  ((H - 1) * Stride - 2 * Padding + Kernel) * Pool,
  ((W - 1) * Stride - 2 * Padding + Kernel) * Pool,
  Channel
]

Concat(x: Tensor[H, W, Cx], y: Tensor[H, W, Cy]): Tensor[H, W, Cx + Cy]

ConvBlock[Channel](x: Tensor[H, W, C]) =
  |> Conv2D[3, 1, 1, Channel]()

UNetEncoder[Channel](x: Tensor[H, W, C]) =
  |> ConvBlock[Channel]()

UNetDecoder[Channel](x: Tensor[H, W, Cx], skip: Tensor[H * 2, W * 2, Channel]) =
  x
  |> Conv2DTransposed[3, 1, 1, 2, Channel]()
  |> Concat(skip)

UNet[Channel](x: Tensor[H, W, C]) =
  |> s1 = UNetEncoder[Channel]()
  |> p1 = MaxPool[2]()
  |> ConvBlock[Channel * 2]()
  |> UNetDecoder[Channel](s1)

`

const result = SourceFile.parse(source, 'Linear.nn')
const context = TypeChecker.check(result)

console.log(inspect(
  context,
  { depth: 3 }
))
