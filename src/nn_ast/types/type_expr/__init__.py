from node import Node

from typing import Union, TYPE_CHECKING

if TYPE_CHECKING:
    from nn_ast.types.type_expr.func import FuncTypeExpr
    from nn_ast.types.type_expr.primitive import PrimitiveTypeExpr

class TypeExpr(Node):
    def __init__(
        self, actual: Union[FuncTypeExpr, PrimitiveTypeExpr], *args, **kwargs
    ) -> None:
        super().__init__(*args, **kwargs)
        self.actual = actual
