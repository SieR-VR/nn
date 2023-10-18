from node import NodeID, Node
from nn_ast import Source, FuncStatement

class Scope:
    variables: dict[NodeID, str]
    unique_ident_set: set[str]

    def __init__(self, parent: "Scope" | None = None) -> None:
        self.variables = {} if parent is None else parent.variables.copy()

    def add(self, id: NodeID, name: str) -> None:
        self.variables[id] = name
    
    def get(self, id: NodeID) -> str | None:
        if id in self.variables:
            return self.variables[id]
        else:
            return None
        
def get_scope_list(source: "Source") -> dict[NodeID, Scope]:
    context = Scope()

    def visitor(node: "Node", context) -> list["Node"]:
        match node:
            case Source():
                node.scope = Scope()
            case FuncStatement():
                node.scope = Scope(context)
                
            case _:
                return [node]

    visit_recursively(source, visitor)