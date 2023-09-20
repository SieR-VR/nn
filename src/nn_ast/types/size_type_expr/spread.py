from node import Node
from tokenize import TokenInfo


class SpreadSizeType(Node):
    def __init__(self, ident: TokenInfo, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.ident = ident.string
