from node import Node
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from source_file import SourceFile
    from nn_ast.statement import Statement


class Source(Node):
    stmts: list["Statement"]

    def __init__(
        self, stmts: list["Statement"], source: "SourceFile", *args, **kwargs
    ) -> None:
        super().__init__(source, *args, **kwargs)
        self.stmts = stmts
