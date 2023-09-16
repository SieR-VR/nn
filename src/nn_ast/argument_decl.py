from node import Node
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from nn_ast.types.type_expr import TypeExpr

class ArgumentDecl(Node):
    def __init__(
        self,
        type: "TypeExpr",
        name: str,
        *args,
        **kwargs
    ) -> None:
        super().__init__(*args, **kwargs)
        self.type = type
        self.name = name