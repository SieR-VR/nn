from node import Node
from tokenize import TokenInfo


class ImportStatement(Node):
    def __init__(
        self, items: list[TokenInfo], path: TokenInfo, *args, **kwargs
    ) -> None:
        super().__init__(*args, **kwargs)
        self.items = [item.string for item in items]
        self.path = path
