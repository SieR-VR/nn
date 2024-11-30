import { SourceFile } from "nn-language"
import { TypeChecker } from "nn-type-checker"

import { declaration } from "./declaration"

import tinygrad from "./tinygrad"

export interface PySynthSettings {
  version: "0.1" | string
  target: "tinygrad" | string

  operations: Operation[]
}

export function getSettings(value: string, reader: (path: string) => string): PySynthSettings {
  if (value === "tinygrad") {
    return tinygrad
  }

  return JSON.parse(reader(value)) 
}

interface Operation {
  /** 
   * The name of the operation in target framework
  */
  opName: string,

  /**
   * Flag to indicate if the operation is a tensor operation
   * i.e. true if it called like x.opName(y) 
   */
  tensorOp: boolean,

  /**
   * The target operation to convert to.
   */
  target: string,
}

function importClause(settings: PySynthSettings): string {
  switch (settings.target) {
    case "tinygrad":
      return "from tinygrad import Tensor"
  }

  return ""
}

export function codegen(source: SourceFile, checker: TypeChecker, settings: PySynthSettings): string {
  let code = "# Generated by nn-codegen\n" +
    `# Version: ${settings.version}\n` +
    `# Target: ${settings.target}\n\n` +
    importClause(settings) + "\n\n";

  source.tree.forEach((decl) => {
    code += declaration(decl, checker, settings)
  })

  return code
} 