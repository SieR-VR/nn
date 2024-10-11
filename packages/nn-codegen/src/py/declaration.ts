import { Declaration } from "nn-language";
import { TypeChecker } from "nn-type-checker";
import { PySynthSettings } from ".";
import { expressions } from "./expression";

export function declaration(declaration: Declaration, checker: TypeChecker, settings: PySynthSettings): string {
  if (!declaration.exprs.length) return ""; // Declaration-only function, no need to generate code

  const name = declaration.name.value;

  return `class ${name}:\n` +
`
  def __init__(${initArguments(declaration)}):
    pass

  def ${forwardCallName(settings)}(${forwardArguments(declaration)}):
    ${expressions(declaration, checker, settings)}
`
}

function initArguments(declaration: Declaration) {
  return [
    "self",
    declaration.sizeDeclList 
      ? declaration.sizeDeclList.decls.map((arg) => {
        return `${arg.value}: int`
      })
      : []
  ]
  .join(", ");
}

function forwardArguments(declaration: Declaration) {
  return [
    "self",
    declaration.argumentList.args.map(arg => arg.ident.value)
  ]
  .join(", ");
}

function forwardCallName(settings: PySynthSettings) {
  switch (settings.target) {
    case "tinygrad":
      return "forward"
  }
}
