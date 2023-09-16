from node import Node
from nn_ast.types.size_type import SizeType
from nn_ast.types.generic_type import GenericType
from tokenize import TokenInfo

class PrimitiveTypeExpr(Node):
    def __init__(
        self,
        type_name: TokenInfo,
        size_type: SizeType,
        generic_type: GenericType,
        *args,
        **kwargs
    ) -> None:
        super().__init__(*args, **kwargs)
        self.type_name = type_name.string
        self.size_type = size_type
        self.generic_type = generic_type
