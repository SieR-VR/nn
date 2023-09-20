from node import Node
from nn_ast.types.size_type_expr.ident import IdentSizeType
from nn_ast.types.size_type_expr.number import NumberSizeType
from nn_ast.types.size_type_expr.spread import SpreadSizeType

from typing import Union


class SizeTypeExpr(Node):
    def __init__(
        self,
        actual: Union[IdentSizeType, NumberSizeType, SpreadSizeType],
        *args,
        **kwargs,
    ) -> None:
        super().__init__(*args, **kwargs)
        self.actual = actual
