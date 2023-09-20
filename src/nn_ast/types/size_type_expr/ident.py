from node import Node
from tokenize import TokenInfo


class IdentSizeType(Node):
    def __init__(self, name: TokenInfo, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.name = name.string
