from pegen.parser import Parser
from pegen.tokenizer import Tokenizer
from source_file import SourceFile


class ParserBase(Parser):
    source_file: SourceFile

    def __init__(self, tokenizer: Tokenizer, *args, **kwargs) -> None:
        super().__init__(tokenizer, *args, **kwargs)
        self.source_file = SourceFile(tokenizer._path, tokenizer._lines)
