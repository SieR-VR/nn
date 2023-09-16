class Pos:
    line: int
    col: int

    def __init__(self, line: int, col: int) -> None:
        self.line = line
        self.col = col

    def toJSON(self) -> dict:
        return self.__dict__