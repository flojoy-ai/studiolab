from dataclasses import dataclass
from typing import List, Literal

import reactivex
from pydantic import BaseModel
from reactivex import Observable
from reactivex.subject import BehaviorSubject
import reactivex.operators as ops

fc_json = """
{
  "blocks": [
    {
      "block": "slider",
      "id": "slider1",
      "ins": [],
      "outs": [
        {
          "source": "slider1",
          "target": "add1",
          "sourceParam": "value",
          "targetParam": "a"
        }
      ]
    },
    {
      "block": "slider",
      "id": "slider2",
      "ins": [],
      "outs": [
        {
          "source": "slider2",
          "target": "add1",
          "sourceParam": "value",
          "targetParam": "b"
        }
      ]
    },
    {
      "block": "add",
      "id": "add1",
      "ins": [
        {
          "source": "slider1",
          "target": "add1",
          "sourceParam": "value",
          "targetParam": "a"
        },
        {
          "source": "slider2",
          "target": "add1",
          "sourceParam": "value",
          "targetParam": "b"
        }
      ],
      "outs": [
        {
          "source": "add1",
          "target": "bignum1",
          "sourceParam": "value",
          "targetParam": "value"
        }
      ]
    },
    {
      "block": "bignum",
      "id": "bignum1",
      "ins": [
        {
          "source": "add1",
          "target": "bignum1",
          "sourceParam": "value",
          "targetParam": "value"
        }
      ],
      "outs": []
    }
  ]
  }
"""


@dataclass
class FCBlockFnProps:  # TODO: use typed dict for kwargs
  is_init: bool = False
  kwargs: dict[str, any] = None
  const_value: any = None


def subtract(props: FCBlockFnProps):
  args = props.kwargs
  print(f"subtract: {args}")
  return {"x": args["x"] - args["y"]}


def slider(props: FCBlockFnProps):
  args = props.kwargs
  print(f"slider: {args}")
  return {"x": args}


def constant(props: FCBlockFnProps):
  print(f"constant")
  return {"x": props.const_value}


def gamepad(props: FCBlockFnProps):
  args = props.kwargs
  print(f"gamepad: {args}")
  return {"x": args["x"]}


def button(props: FCBlockFnProps):
  args = props.kwargs
  print(f"button: {args}")
  return {"x": args["x"]}


def bignum(props: FCBlockFnProps):
  args = props.kwargs
  print(f"bignum: {args}")
  if "x" not in args:
    return {"x": 0}
  return {"x": args["x"]}


def add(props: FCBlockFnProps):
  args = props.kwargs
  print(f"add: {args}")
  return {"x": args["x"] + args["y"]}


FUNCTIONS = {
  "slider": slider,
  "gamepad": gamepad,
  "button": button,
  "bignum": bignum,
  "add": add,
  "subtract": subtract,
}


class FCBlockConnection(BaseModel):
  target: str
  source: str
  sourceParam: str
  targetParam: str


class FCBlock(BaseModel):
  id: str
  block: Literal["slider", "gamepad", "button", "bignum", "add", "subtract"]
  ins: List[FCBlockConnection]
  outs: List[FCBlockConnection]


class FlowChart(BaseModel):
  blocks: List[FCBlock]


@dataclass
class FCBlockIO:
  block: FCBlock
  id: str
  i: BehaviorSubject
  o: Observable


def find_islands(blocks: dict[str, FCBlockIO]):
  def dfs(block: FCBlockIO, visited: set[str], island: list[FCBlockIO]):
    visited.add(block.id)
    island.append(block)
    for connection in [i.source for i in block.block.ins] + [
      o.target for o in block.block.outs
    ]:
      if connection in visited:
        continue
      dfs(blocks[connection], visited, island)

  visited = set()
  islands = []
  for block in blocks.values():
    if block.id not in visited:
      island = []
      dfs(block, visited, island)
      islands.append(island)
  return islands


def wire_flowchart(flowchart: FlowChart, on_publish, starter: Observable | BehaviorSubject, ui_inputs: dict[str, BehaviorSubject | Observable]):
  blocks: dict[str, FCBlockIO] = {b.id: FCBlockIO(block=b, id=b.id, i=None, o=None) for b in flowchart.blocks}
  islands = find_islands(blocks)
  for island in islands:
    for block in island:
      fn = FUNCTIONS[block.block.block]

      def run_block(x: FCBlockFnProps):
        return fn(x)

      def make_fc_block_fn_props(x):
        if block.block.block == "constant":
          return FCBlockFnProps(const_value=24601, kwargs=dict())
        elif block.block.block != "add" and block.block.block != "subtract":
          prop_dict = dict()
          for connection in block.block.ins:
            prop_dict[connection.targetParam] = x
        else:
          prop_dict = dict()
          print("ADD/SUBTRACT")  # TODO
          prop_dict["x"] = 1
          prop_dict["y"] = 2

        print(f"Transforming {x} to {prop_dict}")
        return FCBlockFnProps(kwargs=prop_dict)

      def name_output(x):
        return (x, block.id)

      block.i = BehaviorSubject(None)
      block.i.subscribe(lambda x: print(f"Input got {x} for {block.id} regardless of zip"))
      if block.block.id in ui_inputs:
        ui_inputs[block.block.id].subscribe(block.i.on_next, block.i.on_error, block.i.on_completed)
      block.o = block.i.pipe(
        ops.map(make_fc_block_fn_props),
        ops.map(run_block),
        ops.map(name_output)
      )

      block.o.subscribe(lambda x: print(f"Got {x} for {block.id} after zip and transform"))
      block.o.subscribe(lambda x: on_publish(x, block.id), on_error=lambda e: print(e), on_completed=lambda: print("completed"))

  vistedConns = set()

  def rec_connect_blocks(block: FCBlockIO):
    if len(block.block.ins) == 0:
      starter.subscribe(
        block.i.on_next,
        block.i.on_error,
        block.i.on_completed
      )
    else:
      in_zip = reactivex.zip(*[blocks[conn.source].o for conn in block.block.ins])
      in_zip.subscribe(
        block.i.on_next,
        block.i.on_error,
        block.i.on_completed
      )
      for conn in block.block.ins:
        if conn.source + conn.target in vistedConns:
          continue
        vistedConns.add(conn.source + conn.target)
        rec_connect_blocks(blocks[conn.source])

  for block in blocks.values():
    rec_connect_blocks(block)


def main():
  sobs = BehaviorSubject(0)

  def publish_fn(x, id):
    print(f"Publishing for id {id}")
    if x is None:
      print("No value")
    if type(x) == tuple:
      print(f"Got {x[0]}, {x[1].id}")
    else:
      print(x)

  fc = FlowChart.model_validate_json(fc_json)

  ui_inputs = {
    "slider1": reactivex.interval(1).pipe(ops.take(1000)),
    "slider2": reactivex.interval(1.2).pipe(ops.take(2000)),
  }

  wire_flowchart(flowchart=fc, on_publish=publish_fn, starter=sobs, ui_inputs=ui_inputs)

  sobs.on_next(21)

  while True:
    pass

  # incrememnt sliders by 1 per second


if __name__ == "__main__":
  main()
