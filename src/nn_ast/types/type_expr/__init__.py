from node import Node
from nn_ast.types.type_expr.func import FuncTypeExpr
from nn_ast.types.type_expr.primitive import PrimitiveTypeExpr

from typing import Union


class TypeExpr(Node):
    def __init__(
        self, actual: Union[FuncTypeExpr, PrimitiveTypeExpr], *args, **kwargs
    ) -> None:
        super().__init__(*args, **kwargs)
        self.actual = actual
