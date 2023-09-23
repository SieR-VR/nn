from utils import ValueID

from nn_ast.source import Source
from nn_ast.stmts import FuncStatement
from nn_ast.argument_decl import ArgumentDecl
from nn_ast.types.type_expr import TypeExpr, PrimitiveTypeExpr
from nn_ast.types.size_type_expr import SizeTypeExpr, NumberSizeType, IdentSizeType

from nn_backend_onnx.tensor import Tensor

def argument_to_tensor(argument: ArgumentDecl) -> Tensor:
    value_id = ValueID(argument)
    size_type, element_type = type_from_type_expr(argument.type)

    return Tensor(value_id, size_type, element_type)

def type_from_type_expr(type_expr: TypeExpr) -> (list[int | None], str):
    if not isinstance(type_expr.actual, PrimitiveTypeExpr):
        raise Exception("Expected a primitive type expression")

    primitive_type_expr = type_expr.actual
    size_type = [
        sizetype_from_sizetype_expr(size_type_expr.actual)
            for size_type_expr
            in primitive_type_expr.size_type.size_type_list
    ]

    return size_type, "float"

def sizetype_from_sizetype_expr(sizetype_expr: SizeTypeExpr) -> int | None:
    if isinstance(sizetype_expr.actual, NumberSizeType):
        return sizetype_expr.actual.number

    if isinstance(sizetype_expr.actual, IdentSizeType):
        if sizetype_expr.actual.name == "None":
            return None
        else:
            raise Exception("Expected None")

    raise Exception("Expected a number or None")

def visit(tree: Source | None):
    if tree is None:
        return None

    if len(tree.stmts) is not 1:
        raise Exception("Expected exactly one function statement")

    if not isinstance(tree.stmts[0].actual, FuncStatement):
        raise Exception("Expected a function statement")

    entry_func = tree.stmts[0].actual
    entry_func_expr = entry_func.func_expr

    if not entry_func.name == "entry":
        raise Exception("Expected entry function")

    inputs = [argument_to_tensor(argument) for argument in entry_func_expr.arguments]

    return tree.visit()

