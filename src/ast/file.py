from source_file import SourceFile
from node import Node
from statement import Statement

class File(Node):
    stmts: list[Statement]
    
    def __init__(self, stmts: list[Statement], source: SourceFile, *args, **kwargs) -> None:
        super().__init__(0, len(source.content), source, *args, **kwargs)
        self.stmts = stmts
