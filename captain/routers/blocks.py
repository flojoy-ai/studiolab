from asyncio import Future
from typing import Any, Literal, Union, Callable

from fastapi import APIRouter, WebSocket
from pydantic import BaseModel, Field, ValidationError
from reactivex.operators import flat_map_latest
from reactivex import Observable, operators as ops, Subject
from reactivex.subject import BehaviorSubject
from reactivex import create
import asyncio

from captain.controllers.reactive import FlowChart, ReactFlow, wire_flowchart
from captain.logging import logger

router = APIRouter(tags=["blocks"], prefix="/blocks")


@router.get("/")
async def read_blocks():
    return "Hello blocks!"


class IgnoreComplete:
    def __call__(self, source):
        return create(
            lambda observer, scheduler: source.subscribe(
                observer.on_next, lambda err: observer.on_error(err)
            )
        )


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    all_events = BehaviorSubject[str | int](0)
    button_events = BehaviorSubject(0)
    joy_events = BehaviorSubject("axis 0 0")

    def destruct():
        print("completed")
        # TODO

    def on_next_event(event):
        print(event)
        if isinstance(str, event) and event.startswith("axis"):
            joy_events.on_next(event)
        else:
            button_events.on_next(event)

    def on_next_joy(event):
        x = float(event.split(" ")[-1])
        print(f"Joy got {x}, event: {event}")

    def send_button(x) -> Future[None]:
        return asyncio.ensure_future(websocket.send_text(str(x)))

    button_events.pipe(IgnoreComplete()).pipe(
        ops.take_with_time(500), flat_map_latest(send_button)
    ).subscribe(on_next=print, on_error=lambda e: print(e), on_completed=destruct)
    joy_events.pipe(IgnoreComplete()).subscribe(
        on_next=on_next_joy, on_error=lambda e: print(e), on_completed=destruct
    )

    all_events.pipe(IgnoreComplete()).subscribe(
        on_next=on_next_event, on_error=lambda e: print(e), on_completed=destruct
    )

    await websocket.accept()
    while True:
        data = await websocket.receive_text()

        all_events.on_next(data)
        print(f"Got data: {data}")
        if data == "close":
            await websocket.close()
            break


flowchart_bootstrap_subject = BehaviorSubject("")

flowchart_display_subject = BehaviorSubject("")


@router.websocket("/nodes")
async def websocket_endpoint_nodes(websocket: WebSocket):
    send_msg = send_message_factory(websocket)
    global flowchart_display_subject
    global flowchart_bootstrap_subject

    flowchart_bootstrap_subject.pipe(ops.map(lambda x: str(x)[::-1])).subscribe(
        on_next=lambda x: flowchart_display_subject.on_next(x)
    )

    flowchart_display_subject.pipe(flat_map_latest(send_msg)).subscribe(
        on_next=print, on_error=lambda e: print(e), on_completed=print("completed")
    )

    await websocket.accept()

    while True:
        data = await websocket.receive_text()
        flowchart_bootstrap_subject.on_next(data)
        print(f"Got data: {data}")
        if data == "close":
            await websocket.close()
            break


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


class Flow:
    flowchart: FlowChart
    ui_inputs: dict[str, Subject]

    def __init__(
        self, flowchart: FlowChart, publish_fn: Callable, start_obs: Observable
    ) -> None:
        self.flowchart = flowchart
        self.ui_inputs = {}
        for block in flowchart.blocks:
            if block.block_type == "slider":
                logger.debug(f"CreatingFlowStartEvent slider {block.id}")
                self.ui_inputs[block.id] = Subject()
        wire_flowchart(
            flowchart=self.flowchart,
            on_publish=publish_fn,
            starter=start_obs,
            ui_inputs=self.ui_inputs,
        )

    @classmethod
    def from_json(cls, data: str, publish_fn: Callable, start_obs: Observable):
        fc = FlowChart.model_validate_json(data)
        return cls(fc, publish_fn, start_obs)

    def process_ui_event(self, event: FlowUIEvent):
        self.ui_inputs[event.ui_input_id].on_next([("x", event.value)])


@router.websocket("/flowchart")
async def websocket_flowchart(websocket: WebSocket):
    send_msg = send_message_factory(websocket)

    start_obs = Subject()
    start_obs.subscribe(on_next=lambda x: print(f"Got start {x}"))

    def publish_fn(x, id):
        print(f"Publishing {x} for {id}")
        send_msg(FlowStateUpdateEvent(id=id, data=x).model_dump_json())

    await websocket.accept()

    flow: Flow | None = None

    while True:
        data = await websocket.receive_text()
        try:
            message = FlowSocketMessage.model_validate_json(data)
        except ValidationError as e:
            logger.error(str(e))
            continue

        match message.event:
            case FlowStartEvent(rf=rf):
                fc = FlowChart.from_react_flow(rf)
                if flow is None:
                    logger.info("Creating flow from react flow instance")
                    flow = Flow(fc, publish_fn, start_obs)
            case FlowUIEvent():
                if flow is None:
                    logger.error("Can't process UI event for non existent flow")
                else:
                    flow.process_ui_event(message.event)


def send_message_factory(websocket):
    def send_message(x) -> Future[None]:
        """
        USAGE: Flat map to this thingy
        :param x:
        :return:
        """
        print(f"supposed to send {x}")
        return asyncio.ensure_future(websocket.send_text(str(x)))

    return send_message
