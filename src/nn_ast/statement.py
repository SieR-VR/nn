from node import Node
from typing import Union, TYPE_CHECKING

if TYPE_CHECKING:
    from nn_ast.stmts import DeclStatement, ImportStatement, FuncStatement, ExprStatement, ExportStatement, BlockStatement

class Statement(Node):
    def __init__(
        self, 
        actual: Union[
            "DeclStatement", 
            "ImportStatement", 
            "FuncStatement", 
            "ExprStatement", 
            "ExportStatement", 
            "BlockStatement"
        ], 
        *args, 
        **kwargs
    ) -> None:
        super().__init__(*args, **kwargs)
        self.actual = actual
