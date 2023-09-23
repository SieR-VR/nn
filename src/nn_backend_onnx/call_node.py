import onnx
from utils import ValueID

class CallNode:
    def __init__(self, left: str, right: list[ValueID], output: ValueID):
        self.left = left
        self.right = right
        self.output = output

    def to_onnx(self) -> onnx.NodeProto:
        return onnx.helper.make_node(
            self.left,
            list(map(lambda x: x.__str__(), self.right)),
            [self.output.__str__()],
        )
