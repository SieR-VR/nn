from node import Node
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from nn_ast.types.type_expr import TypeExpr
    from nn_ast.expression import Expression

class DeclStatement(Node):
    def __init__(self, ident: str, type_expr: "TypeExpr", expr: "Expression", *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.ident = ident
        self.type_expr = type_expr
        self.expr = expr
        