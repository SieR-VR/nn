from node import Node

class ImportStatement(Node):
    def __init__(self, items: list[str], path: str, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.items = items
        self.path = path