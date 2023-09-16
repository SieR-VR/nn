from node import Node
from nn_ast.expression import Expression

class CallExpression(Node):
    def __init__(self, left: Expression, right: list[Expression], *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.left = left
        self.right = right