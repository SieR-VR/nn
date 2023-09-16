from node import Node

class SpreadSizeType(Node):
    def __init__(self, ident: str, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.ident = ident