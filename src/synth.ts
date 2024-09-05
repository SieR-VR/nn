import { ArgumentList, SizeDeclList, Type } from "./source"

const py = (strings: { raw: readonly string[] }, ...wildcards: any[]) => {
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

  const applier = (wildcard: any) => {
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

export const synth = { py }
