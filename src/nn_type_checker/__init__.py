from node import Node
from nn_ast import Source
from nn_ast.argument_decl import ArgumentDecl
from nn_ast.expression import Expression, CallExpression, FuncExpression, IdentExpression
from nn_ast.types.type_expr import TypeExpr, FuncTypeExpr, PrimitiveTypeExpr,
from nn_ast.types.size_type import SizeType
from nn_ast.types.size_type_expr import SizeTypeExpr, NumberSizeType

from nn_visitor import visit_recursively

class TensorType:
    def __init__(self, shape: list[int | None], dtype: str):
        self.shape = shape
        self.dtype = dtype

class FunctionType:
    def __init__(self, args: list["CheckedType"], ret: "CheckedType"):
        self.args = args
        self.ret = ret

class PrimitiveType:
    def __init__(self, name: str):
        self.name = name

class CheckedType:
    def __init__(self, actual: "TensorType" | "FunctionType" | "PrimitiveType"):
        self.actual = actual

    def from_typeexpr(node: "TypeExpr") -> "CheckedType":
        def match_primitive(node: "PrimitiveTypeExpr") -> "CheckedType":
            def size_type_helper(size: SizeTypeExpr):
                match size.actual:
                    case NumberSizeType():
                        return size.actual.number
                    case _:
                        return None

            match node:
                case PrimitiveTypeExpr(size_type = None, generic_type = None):
                    return CheckedType(PrimitiveType(node.type_name))
                case PrimitiveTypeExpr(type_name = "Tensor", size_type = SizeType()):
                    return CheckedType(TensorType(
                        [size_type_helper(size) for size in  node.size_type.size_type_list],
                        "float32"
                    ))

        match node.actual:
            case PrimitiveTypeExpr():
                return match_primitive(node.actual)
            case FuncTypeExpr():
                pass
            case _:
                raise Exception("Invalid type")

class TypeChecker:
    def __init__(self, source: "Source"):
        self.source = source

    def get_vertexes(self) -> list["Expression" | "ArgumentDecl"]:
        def visitor(node: "Node") -> list["Expression" | "ArgumentDecl"]:
            match node:
                case Expression():
                    return [node]
                case ArgumentDecl():
                    return [node]
                case _:
                    return []

        return visit_recursively(self.source, visitor)

    def set_from_explicit(self):
        vertexes = self.get_vertexes()

        for vertex in vertexes:
            vertex = vertex.actual if isinstance(vertex, Expression) else vertex

            match vertex:
                case CallExpression():
                    pass
                case FuncExpression():
                    pass
                case IdentExpression():
                    pass
                case ArgumentDecl():
                    vertex.checked_type = CheckedType()
