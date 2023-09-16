from node import Node

class NumberSizeType(Node):
    def __init__(self, number: int, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.number = number