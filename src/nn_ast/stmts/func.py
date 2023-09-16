from node import Node
from nn_ast.exprs import FuncExpression
from tokenize import TokenInfo

class FuncStatement(Node):
    def __init__(self, name: TokenInfo, func_expr: FuncExpression, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.name = name.string
        self.func_expr = func_expr