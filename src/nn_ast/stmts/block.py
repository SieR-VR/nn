from node import Node
from nn_ast.statement import Statement


class BlockStatement(Node):
    def __init__(self, stmts: list[Statement], *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.stmts = stmts
