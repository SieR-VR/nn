from node import Node
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from nn_ast.stmts import BlockStatement
    from nn_ast.argument_decl import ArgumentDecl
    from types.size_type_expr import SizeTypeExpr
    from types.type_expr import TypeExpr

class FuncExpression(Node):
    def __init__(
        self,
        sizeType: "SizeTypeExpr",
        type: "TypeExpr",
        arguments: list["ArgumentDecl"],
        return_type: "TypeExpr",
        block: "BlockStatement",
        *args,
        **kwargs
    ) -> None:
        super().__init__(*args, **kwargs)
        self.sizeType = sizeType
        self.type = type
        self.arguments = arguments
        self.return_type = return_type
        self.block = block
