from node import Node
from size_type import SizeType
from generic_type import GenericType

class PrimitiveTypeExpr(Node):
    def __init__(
        self,
        type_name: str,
        size_type: SizeType,
        generic_type: GenericType,
        *args,
        **kwargs
    ) -> None:
        super().__init__(*args, **kwargs)
        self.type_name = type_name
        self.size_type = size_type
        self.generic_type = generic_type
