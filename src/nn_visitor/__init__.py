from typing import Callable, TypeVar
from node import Node

VisitResult = TypeVar("VisitResult")

def visit_recursively(node: Node, visitor: Callable[[Node], "VisitResult"]) -> list["VisitResult"]:
    result = visitor(node)

    for _, child in node.__dict__.values():
        if isinstance(child, Node):
            result += visit_recursively(child, visitor)

    return result
