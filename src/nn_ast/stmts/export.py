from node import Node
from nn_ast.expression import Expression
from tokenize import TokenInfo

class ExportStatement(Node):
    def __init__(self, item: Expression, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.item = item