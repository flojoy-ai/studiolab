from typing import List, Literal, Tuple, Any
from pydantic import BaseModel
import reactivex as rx
from reactivex import Observable
from reactivex.subject import BehaviorSubject
import reactivex.operators as ops
import itertools

FLOWCHART = """
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


def slider(x):
  print(f"slider: {x}")
  return {"value": x}


def gamepad(x):
  print(f"gamepad: {x}")
  return {"value": x}


def button(x: bool):
  print(f"button: {x}")
  return {"value": x}


def bignum(x):
  print(f"bignum: {x}")
  return {"value": x}


def add(x, y):
  print(f"add: {x} + {y}")
  return {"value": x + y}


def subtract(x, y):
  print(f"subtract: {x} - {y}")
  return {"value": x}


FUNCTIONS = {
  "slider": slider,
  "gamepad": gamepad,
  "button": button,
  "bignum": bignum,
  "add": add,
  "subtract": subtract,
}


def build_flowchart(
  fc_json: str, start_observable: BehaviorSubject, publish_fn
):
  fc = FlowChart.model_validate_json(fc_json)

  blocks = {block.id: block for block in fc.blocks}
  islands = find_islands(blocks)

  all_subjects = {}
  graph_subjects = [
    build_graph(blocks, island, subjects=all_subjects) for island in islands
  ]

  for blk, inp, out in itertools.chain(all_subjects.values()):
    print(f"Subscribing {blk.id}'s output to publish_fn {out}")
    out.subscribe(on_next=lambda x: publish_fn((x, blk)))

  in_subjects = [inp for blk, inp, outp in all_subjects.values() if len(blk.ins) == 0]

  print(f"Starting with {len(in_subjects)} inputs")

  def call_all_ins(x):
    for subj in in_subjects:
      if x is None:
        print("No value")
      else:
        print(f"Starting with {x} for {subj}")
        subj.on_next(x)

  start_observable.subscribe(on_next=call_all_ins)

  return graph_subjects


def build_graph(
  blocks: dict[str, FCBlock],
  island: list[FCBlock],
  subjects: dict[str, Tuple[FCBlock, BehaviorSubject, Observable]],
) -> list[Tuple[FCBlock, BehaviorSubject, Observable]]:
  terminals = list(filter(lambda b: len(b.outs) == 0, island))

  def rec_build_graph(block: FCBlock) -> Tuple[FCBlock, BehaviorSubject, Observable]:
    tup = subjects.get(block.id)
    if tup is None:
      print(f"creating subject for {block.id}")
      input: BehaviorSubject[Any] = BehaviorSubject(None)
      input.subscribe(on_next=lambda x: print(f"Got {x} for {block.id} from initial creation"))
      output = input.pipe(ops.map(lambda x: FUNCTIONS[block.block](x)))
      output.subscribe(on_next=lambda x: print(f"Got {x} for {block.id} from initial creation after pipe"), on_error=print)
      print(f"Created output pipe for {block.id} with {output}")
      subjects[block.id] = (block, input, output)
    else:
      _, input, output = tup

    if len(block.ins) == 0:
      print("reached terminal block with no inputs " + block.id)
      return block, input, output

    def destruct_subj(x, edge):
        print(f"destructing {x} for {edge.source} -> {edge.target} with {edge.sourceParam} -> {edge.targetParam}")
        if x is None:
          return x;
        if type(x) == "tuple" or type(x) == "list" or type(x) == "dict" or type(x) == "set" or type(x) == "object":
          return (edge.targetParam, x[edge.sourceParam])
        else:
          return (edge.targetParam, x)

    in_subjects = [
      rec_build_graph(blocks[edge.source])[2]
      .pipe( ops.map(lambda x: destruct_subj(x, edge)))
      for edge in block.ins
    ]

    print(f"in subject is {in_subjects}")


    for subject in in_subjects:
      subject.subscribe(on_next=lambda x: print(f"Got {x} from in subjects of {block.id} whose length is {len(in_subjects)}"))


    print(f"wiring up graph, block {block.id} is being connected to {len(in_subjects)} inputs")

    zipped_in = rx.zip(*in_subjects).pipe(
      ops.map(lambda ins: {f"{param}": sub for param, sub in ins})
    )

    zipped_in.subscribe(on_next=lambda x: input.on_next(x))

    input.subscribe(on_next=lambda x: print(f"Input got {x} for {block.id} after zip"))

    zipped_in.subscribe(on_next=lambda x: print(f"Got {x} for {block.id} after zip"))


    return block, input, output

  return [rec_build_graph(term) for term in terminals]


def find_islands(blocks: dict[str, FCBlock]):
  def dfs(block: FCBlock, visited: set[str], island: list[FCBlock]):
    visited.add(block.id)
    island.append(block)
    for connection in [i.source for i in block.ins] + [
      o.target for o in block.outs
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


def main():
  sobs = BehaviorSubject(0)

  def publish_fn(x):
    print(f"Publishing")
    if x is None:
      print("No value")
    if type(x) == tuple:
      print(f"Got {x[0]}, {x[1].id}")
    else:
      print(x)

  fc = build_flowchart(
    fc_json=FLOWCHART, start_observable=sobs, publish_fn=publish_fn
  )

  sobs.on_next(21)


if __name__ == "__main__":
  main()

# def build_node(fn, inputObservables, output_obs, render):
#     def start_next_observable(x):
#         output_obs.on_next(x)
#
#     node: BehaviorSubject[FlojoyNodeIO] = BehaviorSubject(FlojoyNodeIO("payload", "name", is_default=True))
#     node.pipe(ops.map(lambda vals: fn(*vals)), ops.flat_map_latest(render)).subscribe(on_next=start_next_observable)
#
#     source = rx.zip(*inputObservables)
#     source.subscribe(node.on_next)
#     return node
#
# @dataclass
# class FlojoyNodeIO:
#     payload: str
#     name: str
#     is_default: bool = False
