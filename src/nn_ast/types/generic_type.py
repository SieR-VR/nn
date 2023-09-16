from node import Node
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from nn_ast.types.type_expr import TypeExpr

class GenericType(Node):
    def __init__(self, type_list: list["TypeExpr"], *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.type_list = type_list