from source_file import SourceFile
from utils import Pos

class Node:
    start: Pos
    end: Pos
    sourceFile: SourceFile

    def __init__(self, source: SourceFile, lineno: int, end_lineno: int, col_offset: int, end_col_offset: int) -> None:
        self.start = Pos(lineno, col_offset)
        self.end = Pos(end_lineno, end_col_offset)
        self.sourceFile = source

    def __str__(self) -> str:
        return self.sourceFile[self.start:self.end]