from google.protobuf import any_pb2 as _any_pb2
from google.protobuf import descriptor as _descriptor
from google.protobuf import message as _message
from typing import ClassVar as _ClassVar, Mapping as _Mapping, Optional as _Optional, Union as _Union

DESCRIPTOR: _descriptor.FileDescriptor

class FlowchartRequest(_message.Message):
    __slots__ = ["start", "cancel", "control"]
    START_FIELD_NUMBER: _ClassVar[int]
    CANCEL_FIELD_NUMBER: _ClassVar[int]
    CONTROL_FIELD_NUMBER: _ClassVar[int]
    start: FlowchartStartRequest
    cancel: FlowchartCancelRequest
    control: FlowchartControlRequest
    def __init__(self, start: _Optional[_Union[FlowchartStartRequest, _Mapping]] = ..., cancel: _Optional[_Union[FlowchartCancelRequest, _Mapping]] = ..., control: _Optional[_Union[FlowchartControlRequest, _Mapping]] = ...) -> None: ...

class FlowchartStartRequest(_message.Message):
    __slots__ = ["rf"]
    RF_FIELD_NUMBER: _ClassVar[int]
    rf: _any_pb2.Any
    def __init__(self, rf: _Optional[_Union[_any_pb2.Any, _Mapping]] = ...) -> None: ...

class FlowchartCancelRequest(_message.Message):
    __slots__ = []
    def __init__(self) -> None: ...

class FlowchartControlRequest(_message.Message):
    __slots__ = ["block_id", "value"]
    BLOCK_ID_FIELD_NUMBER: _ClassVar[int]
    VALUE_FIELD_NUMBER: _ClassVar[int]
    block_id: str
    value: _any_pb2.Any
    def __init__(self, block_id: _Optional[str] = ..., value: _Optional[_Union[_any_pb2.Any, _Mapping]] = ...) -> None: ...

class FlowchartReply(_message.Message):
    __slots__ = ["block_id", "value"]
    BLOCK_ID_FIELD_NUMBER: _ClassVar[int]
    VALUE_FIELD_NUMBER: _ClassVar[int]
    block_id: str
    value: _any_pb2.Any
    def __init__(self, block_id: _Optional[str] = ..., value: _Optional[_Union[_any_pb2.Any, _Mapping]] = ...) -> None: ...
