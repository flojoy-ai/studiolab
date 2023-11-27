from typing import Any, Literal, TypeAlias, Union

from pydantic import BaseModel, Field

from captain.types.flowchart import ReactFlow

UIInputID: TypeAlias = str


class FlowStartEvent(BaseModel):
    event_type: Literal["start"]
    rf: ReactFlow


class FlowCancelEvent(BaseModel):
    event_type: Literal["cancel"]


class FlowUIEvent(BaseModel):
    event_type: Literal["ui"]
    ui_input_id: UIInputID
    value: Any


class FlowStateUpdateEvent(BaseModel):
    event_type: Literal["state_update"] = "state_update"
    id: str
    data: Any


class FlowSocketMessage(BaseModel):
    event: Union[FlowStartEvent, FlowCancelEvent, FlowUIEvent] = Field(
        ..., discriminator="event_type"
    )
