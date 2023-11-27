from typing import Any, Literal, Union

from pydantic import BaseModel, Field

from captain.types.flowchart import BlockID, ReactFlow


class FlowStartEvent(BaseModel):
    event_type: Literal["start"]
    rf: ReactFlow


class FlowCancelEvent(BaseModel):
    event_type: Literal["cancel"]


class FlowControlEvent(BaseModel):
    event_type: Literal["control"]
    block_id: BlockID
    value: Any


class FlowStateUpdateEvent(BaseModel):
    event_type: Literal["state_update"] = "state_update"
    id: str
    data: Any


class FlowSocketMessage(BaseModel):
    event: Union[FlowStartEvent, FlowCancelEvent, FlowControlEvent] = Field(
        ..., discriminator="event_type"
    )
