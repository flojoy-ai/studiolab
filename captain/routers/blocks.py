import multiprocessing
from asyncio import Future
from dataclasses import dataclass

import reactivex
from fastapi import APIRouter, WebSocket
from reactivex.operators import flat_map_latest
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



flowchart_bootstrap_subject = BehaviorSubject(0)

flowchart_display_subject = BehaviorSubject(0)

@router.websocket("/nodes")
async def websocket_endpoint_nodes(websocket: WebSocket):
  send_msg = send_message_factory(websocket)
  global flowchart_display_subject
  global flowchart_bootstrap_subject


  flowchart_bootstrap_subject.pipe(ops.map(lambda x: str(x)[::-1])).subscribe(on_next=lambda x: flowchart_display_subject.on_next(x))



  flowchart_display_subject.pipe(flat_map_latest(send_msg)).subscribe(on_next=print, on_error=lambda e: print(e), on_completed=print("completed"))

  await websocket.accept()

  while True:
    data = await websocket.receive_text()
    flowchart_bootstrap_subject.on_next(data)
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


def send_message_factory(websocket):
  def send_message(x) -> Future[None]:
    """
    USAGE: Flat map to this thingy
    :param x:
    :return:
    """
    return asyncio.ensure_future(websocket.send_text(str(x)))

  return send_message


@dataclass
class FlojoyNodeIO:
  payload: str
  name: str
  is_default: bool = False

def build_node(fn, inputObservables, output_obs, render):
  def start_next_observable(x):
    output_obs.on_next(x)

  node: BehaviorSubject[FlojoyNodeIO] = BehaviorSubject(FlojoyNodeIO("payload", "name", is_default=True))
  node.pipe(ops.map(fn), ops.flat_map_latest(render)).subscribe(on_next=start_next_observable())

  source = reactivex.zip(*inputObservables)
  source.subscribe(node.on_next)
  return node
