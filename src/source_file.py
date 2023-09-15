class SourceFile:
    path: str
    content: str

    def __init__(self, path: str):
        self.path = path
        self.content = open(path).read()

    def __getitem__(self, slice: slice) -> str:
        return self.content[slice]