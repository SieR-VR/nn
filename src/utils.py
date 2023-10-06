from typing import TYPE_CHECKING
from hashlib import sha1

if TYPE_CHECKING:
    from node import Node
    from source_file import SourceFile

class Pos:
    line: int
    col: int

    def __init__(self, line: int, col: int) -> None:
        self.line = line
        self.col = col

    def toJSON(self) -> dict:
        return self.__dict__

class ValueID:
    source_file: "SourceFile"
    pos: tuple["Pos", "Pos"]
    name: str | None

    def __init__(self, target: "Node") -> None:
        self.source_file = target.source_file
        self.pos = target.start, target.end
        self.name = target.name if hasattr(target, "name") else None

    def __str__(self) -> str:
        source_hash = sha1(self.source_file.__str__().encode()).hexdigest()

        start, end = self.pos
        pos_hash = sha1([start.line, start.col, end.line, end.col]).hexdigest()

        if self.name:
            return f"{self.name}_{source_hash}_{pos_hash}"
        else:
            return f"{source_hash}_{pos_hash}"
