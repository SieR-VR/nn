from node import Node
from nn_ast.exprs import FuncExpression

class FuncStatement(Node):
    def __init__(self, name: str, func_expr: FuncExpression, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.name = name
        self.func_expr = func_expr