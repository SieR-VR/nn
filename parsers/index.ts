import Block from "./block";
import ExpressionList from "./expressionList";
import Function from "./function";
import FunctionCall from "./functionCall";
import FunctionParam from "./functionParam";
import FunctionType from "./functionType";
import FunctionTypeParam from "./functionTypeParam";
import Identifier from "./identifier";
import IdentifierExpression from "./identifierExpression";
import Let from "./let";
import NamedFunction from "./namedFunction";
import NumericLiteral from "./numericLiteral";
import PrimitiveType from "./primitiveType";
import PrimitiveTypeParam from "./primitiveTypeParam";
import SizeTypeParam from "./sizeTypeParam";
import TensorType from "./tensorType";
import VariableWithType from "./variableWithType";

export const nnParsers = [
    Block,
    ExpressionList,
    Function,
    FunctionCall,
    FunctionParam,
    FunctionType,
    FunctionTypeParam,
    Identifier,
    IdentifierExpression,
    Let,
    NamedFunction,
    NumericLiteral,
    PrimitiveType,
    PrimitiveTypeParam,
    SizeTypeParam,
    TensorType,
    VariableWithType
] as const;