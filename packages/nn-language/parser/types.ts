import type * as ohm from "ohm-js"

export interface Mapping {
  [key: string]:
  | {
    [key: string]:
    | number
    | string
    | boolean
    | ((children: Wrapper[]) => any)
  }
  | number
}

export interface Wrapper {
  _node: ohm.Node
  source: ohm.Interval

  toAST(mapping: Mapping): any
}

export interface Position {
  pos: number
  end: number
}

export interface Diagnostic {
  message: string
  position: Position
}
