from source_file import SourceFile
from node import Node
from typing import Union

class DeclStatement(Node):
    def __init__(self, ident: str, type_expr: TypeExpression, expr: Expression, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.ident = ident
        self.type_expr = type_expr
        self.expr = expr

class ImportStatement(Node):
    def __init__(self, items: list[str], path: str, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.items = items
        self.path = path

class ExprStatement(Node):
    def __init__(self, expr: Expression, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.expr = expr

class FuncStatement(Node):
    def __init__(self, name: str, func_expr: FuncExpression, *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.name = name
        self.func_expr = func_expr

class Statement(Node):
    def __init__(self, actual: Union[DeclStatement, ExprStatement], *args, **kwargs) -> None:
        super().__init__(*args, **kwargs)
        self.actual = actual
