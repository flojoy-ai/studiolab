# import asyncio
# from asyncio import Future
# from typing import Any

# import reactivex.operators as ops

from fastapi import APIRouter, WebSocket
from pydantic import ValidationError
from reactivex import Subject

from captain.controllers.reactive import Flow
from captain.logging import logger
from captain.types.events import (
    FlowCancelEvent,
    FlowControlEvent,
    FlowSocketMessage,
    FlowStartEvent,
    FlowStateUpdateEvent,
)
from captain.types.flowchart import FlowChart
from captain.utils.ws import send_message_factory

# from reactivex import create
# from reactivex.subject import BehaviorSubject


router = APIRouter(tags=["blocks"], prefix="/blocks")


@router.websocket("/flowchart")
async def websocket_flowchart(websocket: WebSocket):
    # TODO: Joey: try out gRPC streaming instead of WebSocket
    """Entry point for running a flow chart."""
    send_msg = send_message_factory(websocket)

    start_obs = Subject()
    start_obs.subscribe(on_next=lambda x: logger.info(f"Got start {x}"))

    def publish_fn(x, id):
        logger.debug(f"Publishing {x} for {id}")
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
                if flow is None:
                    fc = FlowChart.from_react_flow(rf)
                    logger.info("Creating flow from react flow instance")
                    flow = Flow(fc, publish_fn, start_obs)
            case FlowCancelEvent():
                flow = None
                logger.info("Cancelling flow")
            case FlowControlEvent():
                if flow is None:
                    logger.error("Can't process UI event for non existent flow")
                else:
                    logger.debug(f"Got UI event {message.event}")
                    flow.process_ui_event(message.event)


# class IgnoreComplete:
#     def __call__(self, source):
#         return create(
#             lambda observer, scheduler: source.subscribe(
#                 observer.on_next, lambda err: observer.on_error(err)
#             )
#         )


# @router.websocket("/ws")
# async def websocket_endpoint(websocket: WebSocket):
#     all_events = BehaviorSubject[str | int](0)
#     button_events = BehaviorSubject(0)
#     joy_events = BehaviorSubject("axis 0 0")
#
#     def destruct():
#         print("completed")
#         # TODO
#
#     def on_next_event(event):
#         print(event)
#         if isinstance(str, event) and event.startswith("axis"):
#             joy_events.on_next(event)
#         else:
#             button_events.on_next(event)
#
#     def on_next_joy(event):
#         x = float(event.split(" ")[-1])
#         print(f"Joy got {x}, event: {event}")
#
#     def send_button(x) -> Future[None]:
#         return asyncio.ensure_future(websocket.send_text(str(x)))
#
#     button_events.pipe(IgnoreComplete()).pipe(
#         ops.take_with_time(500), ops.flat_map_latest(send_button)
#     ).subscribe(on_next=print, on_error=lambda e: print(e), on_completed=destruct)
#     joy_events.pipe(IgnoreComplete()).subscribe(
#         on_next=on_next_joy, on_error=lambda e: print(e), on_completed=destruct
#     )
#
#     all_events.pipe(IgnoreComplete()).subscribe(
#         on_next=on_next_event, on_error=lambda e: print(e), on_completed=destruct
#     )
#
#     await websocket.accept()
#     while True:
#         data = await websocket.receive_text()
#
#         all_events.on_next(data)
#         print(f"Got data: {data}")
#         if data == "close":
#             await websocket.close()
#             break
