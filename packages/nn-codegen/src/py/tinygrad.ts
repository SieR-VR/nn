import { PySynthSettings } from "."

const tinygrad: PySynthSettings = {
  version: "0.1",
  target: "tinygrad",
  operations: [
    {
      opName: "conv2d",
      tensorOp: true,
      target: "Conv2D"
    },
    {
      opName: "relu",
      tensorOp: true,
      target: "ReLU"
    },
    {
      opName: "batchnorm",
      tensorOp: true,
      target: "BatchNorm"
    },
    {
      opName: "max_pool2d",
      tensorOp: true,
      target: "MaxPool2D"
    }
  ]
}

export default tinygrad
