from node import Node
from tokenize import TokenInfo
from typing import TYPE_CHECKING


if TYPE_CHECKING:
    from nn_ast.types.type_expr import TypeExpr

class ArgumentDecl(Node):
    def __init__(
        self,
        name: TokenInfo,
        type: "TypeExpr",
        *args,
        **kwargs
    ) -> None:
        super().__init__(*args, **kwargs)
        self.name = name.string
        self.type = type