import onnx
from utils import ValueID

class Tensor:
    def __init__(self, name: ValueID, shape: list[int | None], element_type: str):
        self.name = name
        self.shape = shape
        self.element_type = element_type

    def to_onnx(self) -> onnx.ValueInfoProto:
        return onnx.helper.make_tensor_value_info(
            self.name,
            onnx.TensorProto.FLOAT,
            self.shape,
        )
