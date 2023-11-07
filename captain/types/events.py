from pydantic import BaseModel, Field
from typing import Literal, Any, Union

from captain.types.flowchart import ReactFlow


class FlowStartEvent(BaseModel):
    event_type: Literal["start"]
    rf: ReactFlow


class FlowUIEvent(BaseModel):
    event_type: Literal["ui"]
    ui_input_id: str
    value: Any


class FlowStateUpdateEvent(BaseModel):
    event_type: Literal["state_update"] = "state_update"
    id: str
    data: Any


class FlowSocketMessage(BaseModel):
    event: Union[FlowStartEvent, FlowUIEvent] = Field(..., discriminator="event_type")
