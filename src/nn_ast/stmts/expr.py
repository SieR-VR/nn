from node import Node
from nn_ast.expression import Expression


class ExprStatement(Node):
    def __init__(self, expr: Expression, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.expr = expr
