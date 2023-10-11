from utils import ValueID

from nn_ast.source import Source
from nn_ast.stmts import FuncStatement, ExprStatement
from nn_ast.exprs import CallExpression, IdentExpression
from nn_ast.argument_decl import ArgumentDecl
from nn_ast.types.type_expr import TypeExpr, PrimitiveTypeExpr
from nn_ast.types.size_type_expr import SizeTypeExpr, NumberSizeType, IdentSizeType

from nn_backend_onnx import Tensor, CallNode

def argument_to_tensor(argument: ArgumentDecl) -> Tensor:
    value_id = ValueID(argument)
    size_type, element_type = type_from_type_expr(argument.type)

    return Tensor(value_id, size_type, element_type)

def type_from_type_expr(type_expr: TypeExpr) -> (list[int | None], str):
    if not isinstance(type_expr.actual, PrimitiveTypeExpr):
        raise Exception("Expected a primitive type expression")

    primitive_type_expr = type_expr.actual
    size_type = [
        sizetype_from_sizetype_expr(size_type_expr)
            for size_type_expr
            in primitive_type_expr.size_type.size_type_list
    ]

    return size_type, "float"

def return_type_to_tensor(return_type: TypeExpr) -> Tensor:
    size_type, element_type = type_from_type_expr(return_type)

    return Tensor(ValueID(return_type), size_type, element_type)

def sizetype_from_sizetype_expr(sizetype_expr: SizeTypeExpr) -> int | None:
    if isinstance(sizetype_expr.actual, NumberSizeType):
        return sizetype_expr.actual.number

    if isinstance(sizetype_expr.actual, IdentSizeType):
        if sizetype_expr.actual.name == "None":
            return None
        else:
            raise Exception("Expected None")

    raise Exception("Expected a number or None")

def visit_call_expression(call_expression: CallExpression) -> tuple[Tensor, list[CallNode]]:
    call_nodes: list[CallNode] = []
    argument_tensors: list[Tensor] = []

    for argument in call_expression.right:
        match argument:
            case CallExpression():
                tensor, call_node = visit_call_expression(argument)
                call_nodes += call_node
                argument_tensors.append(tensor)
            case IdentExpression():
                value_id = ValueID(argument)
                tensor = Tensor(value_id, [], "float")
                argument_tensors.append(tensor)
            case _:
                raise Exception("Expected call expression or ident expression")

    value_id = ValueID(call_expression)
    tensor = Tensor(value_id, [], "float")
    call_node = CallNode(
        call_expression.left.name,
        [argument.name for argument in argument_tensors],
        tensor.name
    )

    return tensor, call_nodes + [call_node]

def visit(tree: Source | None):
    if tree is None:
        return None

    if len(tree.stmts) != 1:
        raise Exception("Expected exactly one function statement")

    if not isinstance(tree.stmts[0].actual, FuncStatement):
        raise Exception("Expected a function statement")

    entry_func = tree.stmts[0].actual
    entry_func_expr = entry_func.func_expr

    if not entry_func.name == "entry":
        raise Exception("Expected entry function")

    inputs = [argument_to_tensor(argument) for argument in entry_func_expr.arguments]
    outputs = [return_type_to_tensor(entry_func_expr.return_type)]
    call_nodes = []

    for stmt in entry_func_expr.block.stmts:
        match stmt.actual:
            case ExprStatement(expr = expression):
                if not isinstance(expression, CallExpression):
                    raise Exception("Expected a call expression")

                _, call_node = visit_call_expression(expression)
                call_nodes += call_node
            case _:
                pass

    return inputs, outputs, call_nodes
