export interface Position {
  pos: number
  end: number
}

export interface Diagnostic {
  message: string

  position: Position
}
