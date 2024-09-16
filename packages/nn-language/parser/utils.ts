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

type IsCallback<T extends Node> = (node: Node) => node is T
type BooleanCallback = (node: Node) => boolean
type TravelCallback<T> =
  T extends Node ? IsCallback<T> : (node: Node) => T | undefined

export function travel<T>(node: Node | Node[], callback: TravelCallback<T> | BooleanCallback): T[] {
  const result: T[] = []

  const _travel = (node: Node) => {
    const res = callback(node)
    if (typeof res === "boolean") {
      res && result.push(node as T)
    } else if (res !== undefined) {
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

export function nodeOnPosition<T extends Node = Node>(node: Node | Node[], position: number, filter?: TravelCallback<T> | BooleanCallback): T | undefined {
  const filtered = travel(node, filter)

  return filtered.find(node => {
    const { pos, end } = node.position
    return position >= pos && position <= end
  })
}
