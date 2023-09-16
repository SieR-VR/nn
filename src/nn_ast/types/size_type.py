from node import Node
from nn_ast.types.size_type_expr import SizeTypeExpr

class SizeType(Node):
    def __init__(self, size_type_list: list[SizeTypeExpr], *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.size_type_list = size_type_list