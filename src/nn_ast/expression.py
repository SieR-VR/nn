from node import Node
from typing import Union, TYPE_CHECKING

if TYPE_CHECKING:
    from nn_ast.exprs import CallExpression, FuncExpression, IdentExpression

class Expression(Node):
    def __init__(
        self,
        actual: Union["CallExpression", "FuncExpression", "IdentExpression"],
        *args,
        **kwargs
    ) -> None:
        super().__init__(*args, **kwargs)
        self.actual = actual
