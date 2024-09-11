import { Wrapper, Position } from "./types"
import { Node } from "./ast"

export function toPosition(wrapper: Wrapper | Wrapper[]): Position {
  if (Array.isArray(wrapper)) {
    return {
      pos: wrapper[0].source.startIdx,
      end: wrapper[wrapper.length - 1].source.endIdx,
    }
  }

  return {
    pos: wrapper.source.startIdx,
    end: wrapper.source.endIdx,
  }
}

export function travel<T>(node: Node | Node[], callback: (node: Node) => T | undefined): T[] {
  const result: T[] = []

  const _travel = (node: Node) => {
    const res = callback(node)
    if (res !== undefined) {
      result.push(res)
    }

    if (node.type === "Declaration") {
      node.exprs.forEach(_travel)
    }

    if (node.type === "CallExpression") {
      node.args.forEach(_travel)
    }

    if (node.type === "TupleExpression") {
      node.elements.forEach(_travel)
    }
  }

  if (Array.isArray(node)) {
    node.forEach(_travel)
  } else {
    _travel(node)
  }
  
  return result
}
