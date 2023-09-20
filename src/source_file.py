from utils import Pos


class SourceFile:
    path: str
    content: list[str]

    def __init__(self, path: str, content: list[str]) -> None:
        self.path = path
        self.content = content

    def __getitem__(self, slice: slice) -> str:
        start: Pos = slice.start
        end: Pos = slice.stop
        result = ""

        for line in range(start.line, end.line + 1):
            if line == start.line:
                result += self.content[line][start.col :]
            elif line == end.line:
                result += self.content[line][: end.col]
            else:
                result += self.content[line]

        return result
