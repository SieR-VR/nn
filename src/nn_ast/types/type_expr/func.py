from node import Node
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from nn_ast.types.size_type import SizeType
    from nn_ast.types.type_expr import TypeExpr
    from nn_ast.types.generic_type import GenericType

class FuncTypeExpr(Node):
    def __init__(
        self,
        size_type: "SizeType",
        generic_type: "GenericType",
        param_list: list["TypeExpr"],
        return_type: "TypeExpr",
        *args,
        **kwargs
    ) -> None:
        super().__init__(*args, **kwargs)
        self.size_type = size_type
        self.generic_type = generic_type
        self.param_list = param_list
        self.return_type = return_type