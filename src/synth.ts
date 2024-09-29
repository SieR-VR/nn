import { match_string } from "ts-features"
import { ArgumentList, CallExpression, Declaration, Expression, Identifier, IdentifierExpression, isCallExpression, Node, SizeDeclList, SizeNode, StringLiteralExpression, travel, TupleExpression, TypeNode } from "nn-language"

const opsMap: Record<string, { tensorOp: boolean, target: string }> = {
  "MatMul": {
    tensorOp: true,
    target: "dot"
  },
  "Bias": {
    tensorOp: true,
    target: "add"
  }
}

const py = (strings: { raw: readonly string[] }, ...wildcards: (string | Node | undefined)[]) => {
  const convertType = (type: TypeNode) => {
    if (!type.isTensor) {
      // TODO if type is not tensor
      throw new Error("Not Implemented")
    }

    return `Tensor`
  }

  const convertSize = ({ decls }: SizeDeclList) => {
    return decls.map(decl => decl.value).join(", ")
  }

  const convertArguments = ({ args }: ArgumentList) => {
    return args
      .map((arg) => `${arg.ident.value}: ${convertType(arg.valueType)}`)
      .join(", ")
  }

  const applier = (wildcard: string | Node | undefined) => {
    if (wildcard === undefined) {
      return ""
    }

    if (typeof wildcard === "string") {
      return wildcard
    }

    return match_string<string, string>(wildcard.type, {
      "Type": () => convertType(wildcard as TypeNode),
      "SizeDeclList": () => convertSize(wildcard as SizeDeclList),
      "ArgumentList": () => convertArguments(wildcard as ArgumentList),
      "_": () => ""
    })
  }

  return String.raw(
    strings,
    ...wildcards.map(applier)
  )
}

const pyinits = (decl: Declaration, indent: number = 4) => {
  const synthSizeNode = (node: SizeNode): string => {
    switch (node.sizeType) {
      case "add":
        return `(${synthSizeNode(node.left!)} + ${synthSizeNode(node.right!)})`
      case "mul":
        return `(${synthSizeNode(node.left!)} * ${synthSizeNode(node.right!)})`
      case "pow":
        return `(${synthSizeNode(node.left!)} ** ${synthSizeNode(node.right!)})`
      case "ident":
        return node.ident!.value
      case "number":
        return node.number!.toString()
    }
  }

  const inits = travel(decl, isCallExpression)
    .filter((call) => call.callee.value === 'Trainable')
    .map((call) => {
      const [name] = call.args as [StringLiteralExpression]
      const value = name.value.replace(/["']/g, "")

      return `self.${value} = Tensor.zeros(${
        call.sizes
          ? call.sizes.map(synthSizeNode).join(", ")
          : 0
      })`
    })

  const indentStr = " ".repeat(indent)

  return inits.join(`\n${indentStr}`)
}

const pyforward = (decl: Declaration, indent: number = 4) => {
  const result = []
  let returns = decl.firstPipe
    ? decl.argumentList.args.map((arg) => arg.ident.value)
    : []

  const toPythonExpression = (expr: Expression | Identifier | string): string => {
    if (typeof expr === 'string') {
      return expr
    }

    return match_string<string, string>(expr.type, {
      CallExpression: () => {
        const { callee, args } = expr as CallExpression

        if (callee.value === 'Trainable') {
          const { value } = (expr as CallExpression).args[0] as StringLiteralExpression
          return `self.${value.replace(/["']/g, "")}`
        }

        const right = [...returns, ...args].map(toPythonExpression)

        if (!(callee.value in opsMap)) return ''

        if (opsMap[callee.value].tensorOp) {
          const [first, ...rest] = right

          return `${first}.${opsMap[callee.value].target}(${rest.join(", ")})`
        }
        else {
          return `${callee.value}(${right.join(", ")})`
        }

      },
      IdentifierExpression: () => {
        return (expr as IdentifierExpression).ident.value
      },
      StringLiteralExpression: () => {
        throw new Error("Unreachable StringLiteralExpression as code")
      },
      TupleExpression: () => {
        return `${(expr as TupleExpression).elements.map(toPythonExpression).join(", ")}`
      },
    })
  }


  decl.exprs.forEach((expr) => {
    const [line, returns_] = match_string<[string, string[]], Expression['type']>(expr.type, {
      CallExpression: () => {
        return [
          `y = ${toPythonExpression(expr)}`,
          ['y']
        ]
      },
      IdentifierExpression: () => {
        return [
          `${(expr as IdentifierExpression).ident}`,
          [`${(expr as IdentifierExpression).ident}`]
        ]
      },
      StringLiteralExpression: () => {
        throw new Error("Unreachable StringLiteralExpression as code")
      },
      TupleExpression: () => {
        if ((expr as TupleExpression).elements[0].type === 'CallExpression') {
          const [first, ...rest] = (expr as TupleExpression).elements

          return [
            `y = ${toPythonExpression(first)}`,
            ['y', ...rest.map(toPythonExpression)]
          ]
        }

        return [
          "",
          (expr as TupleExpression).elements.map(toPythonExpression)
        ]
      },
    })

    if (line) result.push(line)
    returns = returns_
  })

  const lastLine = `return ${returns.join(", ")}`
  result.push(lastLine)

  const indentStr = " ".repeat(indent)
  return result.join(`\n${indentStr}`)
}

py.inits = pyinits
py.forward = pyforward

export const synth = { py }
