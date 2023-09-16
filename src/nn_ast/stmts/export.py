from node import Node

class ExportStatement(Node):
    def __init__(self, items: list[str], *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.items = items