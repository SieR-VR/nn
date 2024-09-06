import { ArgumentList, Declaration, Node, SizeDeclList, StringLiteralExpression, travel, Type } from "./source"

const py = (strings: { raw: readonly string[] }, ...wildcards: (string | Node)[]) => {
  const convertType = (type: Type) => {
    if (!type.isTensor) {
      // !TODO
      throw new Error("Not Implemented")
    }

    return `Tensor`
  }

  const convertSize = ({ decls }: SizeDeclList) => {
    return decls.join(", ")
  }

  const convertArguments = ({ args }: ArgumentList) => {
    return args
      .map((arg) => `${arg.ident}: ${convertType(arg.valueType)}`)
      .join(", ")
  }

  const applier = (wildcard: string | Node) => {
    if (typeof wildcard === "string") {
      return wildcard
    }

    if ("type" in wildcard) {
      return {
        "Type": convertType,
        "SizeDeclList": convertSize,
        "ArgumentList": convertArguments,
      }[wildcard.type](wildcard)
    }
  }

  return String.raw(
    strings,
    ...wildcards.map(applier)
  )
}

const pyinits = (decl: Declaration, indent: number = 4) => {
  const calls = travel(decl, (node) => {
    if (node.type === 'CallExpression') {
      return node
    }
  })

  const inits = calls
    .filter((call) => call.callee === 'Trainable')
    .map((call) => {
      const [name] = call.arguments as [StringLiteralExpression]

      return `self.${name.value} = Tensor.zeros(${call.sizes.join(", ")})`
    })

  const indentStr = " ".repeat(indent)

  return inits.join(`\n${indentStr}`)
}

const pyforward = (decl: Declaration, indent: number = 4) => {
  const result = ""

  decl.exprs.forEach((expr) => {
    
  })

  return result
}

py.inits = pyinits
py.forward = pyforward

export const synth = { py }
