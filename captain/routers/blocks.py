from asyncio import Future
from dataclasses import dataclass
from typing import Literal

from fastapi import APIRouter, WebSocket
from pydantic import BaseModel
from reactivex.operators import flat_map_latest
from reactivex import operators as ops, Subject
from reactivex.subject import BehaviorSubject
from reactivex import create
import asyncio

from captain.controllers.reactive import FlowChart, wire_flowchart

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
    all_events = BehaviorSubject(0)
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
        print(f"Joy got {event}")

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


class FCUIFeedback(BaseModel):
    id: str
    value: str
    __discriminator: Literal['FCUIFeedback'] = "FCUIFeedback"


@router.websocket("/flowchart")
async def websocket_flowchart(websocket: WebSocket):
    send_msg = send_message_factory(websocket)

    start_obs = Subject()

    start_obs.subscribe(on_next=lambda x: print(f"Got start {x}") )

    def publish_fn(x, id):
        print(f"Publishing {x} for {id}")
        send_msg({"id": id, "data": str(x)})

    await websocket.accept()

    ui_inputs = dict()

    fc = None

    while True:
        data = await websocket.receive_text()
        print(f"Got data: {data}")
        if fc is None:
            try:
                fc = FlowChart.model_validate_json(data)
                for block in fc.blocks:
                    if block.block_type == "slider":
                        print(f"Creating slider {block.id}")
                        ui_inputs[block.id] = Subject()
                wire_flowchart(flowchart=fc, on_publish=publish_fn, starter=start_obs, ui_inputs=ui_inputs)
            except Exception as e:
                print(f"Error in parsing flowchart {e}")
        if fc is not None and data.startswith("start"):
            print("Starting flowchart")
            start_obs.on_next({})
        elif fc is not None and data.startswith("{"):
            print(f"Got possible json data {data}")
            try:
                fc_ui_feedback = FCUIFeedback.model_validate_json(data)
                print(f"Got FCUIFeedback {fc_ui_feedback}")
                if fc_ui_feedback.id in ui_inputs.keys():
                    print(f"Publishing FCUIFeedback {fc_ui_feedback.value} for {fc_ui_feedback.id}")
                    ui_inputs[fc_ui_feedback.id].on_next([("x", fc_ui_feedback.value)])
                else:
                    print(f"Unknown id {fc_ui_feedback.id} with ui input keys {ui_inputs.keys()}")
            except Exception as e:
                print(f"Error in parsing UI Feedback {e}")
        else:
            print("Got unknown data {}".format(data))

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
