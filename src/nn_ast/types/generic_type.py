from node import Node
from type_expr import TypeExpr

class GenericType(Node):
    def __init__(self, type_list: list[TypeExpr], *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.type_list = type_list