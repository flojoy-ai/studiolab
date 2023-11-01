import multiprocessing
from asyncio import Future

from fastapi import APIRouter, WebSocket
from reactivex.operators import debounce, flat_map_latest
from reactivex import operators as ops
from reactivex.subject import BehaviorSubject
from reactivex import create
import asyncio

router = APIRouter(tags=["blocks"], prefix="/blocks")


@router.get("/")
async def read_blocks():
  return "Hello blocks!"


class IgnoreComplete:
  def __call__(self, source):
    return create(lambda observer, scheduler: source.subscribe(
      observer.on_next,
      lambda err: observer.on_error(err)
    ))


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
    if type(event) == str and event.startswith("axis"):
      joy_events.on_next(event)
    else:
      button_events.on_next(event)

  def on_next_joy(event):
    x = float(event.split(" ")[-1])
    print(f"Joy got {event}")

  def send_button(x) -> Future[None]:
    return asyncio.ensure_future(websocket.send_text(str(x)))

  button_events.pipe(IgnoreComplete()).pipe(ops.take_with_time(500), flat_map_latest(send_button)).subscribe(on_next=print, on_error=lambda e: print(e), on_completed=destruct)
  joy_events.pipe(IgnoreComplete()).subscribe(on_next=on_next_joy, on_error=lambda e: print(e), on_completed=destruct)

  all_events.pipe(IgnoreComplete()).subscribe(on_next=on_next_event, on_error=lambda e: print(e), on_completed=destruct)

  await websocket.accept()
  while True:
    data = await websocket.receive_text()

    all_events.on_next(data)
    print(f"Got data: {data}")
    if data == "close":
      await websocket.close()
      break


def send_message_factory(websocket):
  def send_message(x) -> Future[None]:
    """
    USAGE: Flat map to this thingy
    :param x:
    :return:
    """
    return asyncio.ensure_future(websocket.send_text(str(x)))

  return send_message
