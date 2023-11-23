from node import Node
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from nn_ast.statement import Statement


class Source(Node):
    def __init__(
        self, stmts: list["Statement"], *args, **kwargs
    ) -> None:
        super().__init__(*args, **kwargs)
        self.stmts = stmts
