from source_file import SourceFile
from utils import Pos
import json


def add_class_type_to_dict(dict: dict, instance) -> dict:
    dict["type"] = instance.__class__.__name__
    return dict


class Node:
    start: Pos
    end: Pos
    source_file: SourceFile

    def __init__(
        self,
        source_file: SourceFile,
        lineno: int,
        end_lineno: int,
        col_offset: int,
        end_col_offset: int,
    ) -> None:
        self.start = Pos(lineno, col_offset)
        self.end = Pos(end_lineno, end_col_offset)
        self.source_file = source_file

    def __str__(self) -> str:
        return self.source_file[self.start : self.end]

    def toJSON(self, indent=2) -> dict:
        return json.dumps(
            self,
            default=lambda o: add_class_type_to_dict(o.__dict__, o),
            sort_keys=True,
            indent=indent,
        )
