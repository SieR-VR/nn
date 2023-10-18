from typing import Callable, TypeVar
from node import Node

VisitResult = TypeVar("VisitResult")

def visit_recursively(node: Node, visitor: Callable[[Node, ], "VisitResult"], context = dict) -> list["VisitResult"]:
    context_temp = context
    result = visitor(node, context)

    for _, child in node.__dict__.values():
        if isinstance(child, Node):
            result += visit_recursively(child, visitor, context)

    context = context_temp
    return result
