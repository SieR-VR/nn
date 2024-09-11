import { match_string } from "ts-features"
import { ArgumentList, CallExpression, Declaration, Expression, IdentifierExpression, Node, SizeDeclList, StringLiteralExpression, travel, TupleExpression, TypeNode } from "../packages/nn-language/parser/ast"

const py = (strings: { raw: readonly string[] }, ...wildcards: (string | Node)[]) => {
  const convertType = (type: TypeNode) => {
    if (!type.isTensor) {
      // TODO if type is not tensor
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

    return {
      "Type": convertType,
      "SizeDeclList": convertSize,
      "ArgumentList": convertArguments,
    }[wildcard.type](wildcard)
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
      const [name] = call.args as [StringLiteralExpression]

      return `self.${name.value} = Tensor.zeros(${call.sizes.join(", ")})`
    })

  const indentStr = " ".repeat(indent)

  return inits.join(`\n${indentStr}`)
}

const pyforward = (decl: Declaration, indent: number = 4) => {
  const result = []
  let returns = decl.firstPipe
    ? decl.argumentList.args.map((arg) => arg.ident)
    : []

  const toPythonExpression = (expr: Expression | string) => {
    if (typeof expr === 'string') {
      return expr
    }

    return match_string<string, Expression['type']>(expr.type, {
      CallExpression: () => {
        const { callee, args } = expr as CallExpression

        if (callee === 'Trainable') {
          const { value } = (expr as CallExpression).args[0] as StringLiteralExpression
          return `self.${value}`
        }

        const right = [...returns, ...args].map(toPythonExpression)

        return `${callee}(${right.join(", ")})`
      },
      IdentifierExpression: () => {
        return (expr as IdentifierExpression).ident
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
