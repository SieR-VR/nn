from source_file import SourceFile
from utils import Pos
import json


def add_class_type_to_dict(dict: dict, instance) -> dict:
    dict["type"] = instance.__class__.__name__
    return dict

class NodeID:
    def __init__(self, id: int):
        self.id = id

    def __hash__(self) -> int:
        return self.id
    
    def __eq__(self, other) -> bool:
        return self.id == other.id
        
class NodeIDAllocator:
    def __init__(self):
        self.id = 0
    
    def alloc(self) -> NodeID:
        self.id += 1
        return NodeID(self.id)

global_node_id_allocator = NodeIDAllocator()

class Node:
    start: Pos
    end: Pos
    source_file: SourceFile
    id: NodeID

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
        self.id = global_node_id_allocator.alloc()

    def __str__(self) -> str:
        return self.source_file[self.start : self.end]

    def toJSON(self, indent=2) -> dict:
        return json.dumps(
            self,
            default=lambda o: add_class_type_to_dict(o.__dict__, o),
            sort_keys=True,
            indent=indent,
        )
