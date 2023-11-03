from dataclasses import dataclass
from typing import List, Literal, Any, Tuple

from pydantic import BaseModel
import reactivex as rx
from reactivex import Observable, Subject
import reactivex.operators as ops
from functools import partial

test_fc_json = """
{
  "blocks": [
    {
      "block_type": "constant",
      "id": "constant1",
      "ins": [],
   x,.   "outs": [
        {
          "source": "constant1",
          "target": "add1",
          "sourceParam": "value",
          "targetParam": "x"
        }
      ]
    },
    {
      "block_type": "constant",
      "id": "constant2",
      "ins": [],
      "outs": [
        {
          "source": "constant2",
          "target": "add1",
          "sourceParam": "value",
          "targetParam": "y"
        }
      ]
    },
    {
      "block_type": "add",
      "id": "add1",
      "ins": [
        {
          "source": "constant1",
          "target": "add1",
          "sourceParam": "value",
          "targetParam": "x"
        },
        {
          "source": "constant2",
          "target": "add1",
          "sourceParam": "value",
          "targetParam": "y"
        }
      ],
      "outs": [
        {
          "source": "add1",
          "target": "bignum1",
          "sourceParam": "value",
          "targetParam": "x"
        }
      ]
    },
    {
      "block_type": "bignum",
      "id": "bignum1",
      "ins": [
        {
          "source": "add1",
          "target": "bignum1",
          "sourceParam": "value",
          "targetParam": "x"
        }
      ],
      "outs": []
    }
  ]
  }
"""

slider_fc_json = """
{
  "blocks": [
    {
      "block_type": "slider",
      "id": "slider1",
      "ins": [],
      "outs": [
        {
          "source": "slider1",
          "target": "add1",
          "sourceParam": "value",
          "targetParam": "x"
        }
      ]
    },
    {
      "block_type": "slider",
      "id": "slider2",
      "ins": [],
      "outs": [
        {
          "source": "slider2",
          "target": "add1",
          "sourceParam": "value",
          "targetParam": "y"
        }
      ]
    },
    {
      "block_type": "add",
      "id": "add1",
      "ins": [
        {
          "source": "slider1",
          "target": "add1",
          "sourceParam": "value",
          "targetParam": "x"
        },
        {
          "source": "slider2",
          "target": "add1",
          "sourceParam": "value",
          "targetParam": "y"
        }
      ],
      "outs": [
        {
          "source": "add1",
          "target": "bignum1",
          "sourceParam": "value",
          "targetParam": "x"
        }
      ]
    },
    {
      "block_type": "bignum",
      "id": "bignum1",
      "ins": [
        {
          "source": "add1",
          "target": "bignum1",
          "sourceParam": "value",
          "targetParam": "x"
        }
      ],
      "outs": []
    }
  ]
  }
"""


def subtract(x, y):
    print(f"subtract: {x} - {y}")
    return x - y


def add(x, y):
    print(f"add: {x} + {y}")
    return x + y


def slider(x):
    print(f"slider: {x}")
    return x


def constant():
    print("constant: 2") # TODO: problem: A constant mixed with a live value breaks zip.
    return 2


def gamepad(x):
    print(f"gamepad: {x}")
    return x


def button(x):
    print(f"button: {x}")
    return x


def bignum(x):
    print(f"bignum: {x}")
    return x


FUNCTIONS = {
    "slider": slider,
    "gamepad": gamepad,
    "button": button,
    "bignum": bignum,
    "add": add,
    "subtract": subtract,
    "constant": constant,
}

FN_REQUIRED_PARAMS = {
    "slider": ["x"],
    "gamepad": ["x"],
    "button": ["x"],
    "bignum": ["x"],
    "add": ["x", "y"],
    "subtract": ["x", "y"],
    "constant": [],
}

EVENT_BLOCKS = ["slider", "gamepad", "button"]


class FCBlockConnection(BaseModel):
    target: str
    source: str
    sourceParam: str
    targetParam: str


class Block(BaseModel):
    id: str
    block_type: Literal[
        "slider", "gamepad", "button", "bignum", "add", "subtract", "constant"
    ]


class FCBlock(Block):
    ins: List[FCBlockConnection]
    outs: List[FCBlockConnection]

    @classmethod
    def from_block(cls, block: Block):
        return FCBlock(id=block.id, block_type=block.block_type, ins=[], outs=[])


class FlowChart(BaseModel):
    blocks: List[FCBlock]

    @classmethod
    def from_blocks_edges(cls, blocks: list[Block], edges: list[FCBlockConnection]):
        lookup = {block.id: block for block in blocks}
        fc_blocks: dict[str, FCBlock] = {}

        for edge in edges:
            if edge.target not in fc_blocks:
                fc_blocks[edge.target] = FCBlock.from_block(lookup[edge.target])
            if edge.source not in fc_blocks:
                fc_blocks[edge.source] = FCBlock.from_block(lookup[edge.source])
            fc_blocks[edge.target].ins.append(edge)
            fc_blocks[edge.source].outs.append(edge)


@dataclass
class FCBlockIO:
    block: FCBlock
    i: Subject
    o: Observable


def find_islands(blocks: dict[str, FCBlock]) -> list[list[FCBlock]]:
    visited = set()

    def dfs(block: FCBlock, island: list[FCBlock]):
        visited.add(block.id)
        island.append(block)
        neighbors = [i.source for i in block.ins] + [o.target for o in block.outs]
        for connection in neighbors:
            if connection in visited:
                continue
            dfs(blocks[connection], island)

    islands: list[list[FCBlock]] = []
    for block in blocks.values():
        if block.id not in visited:
            island: list[FCBlock] = []
            dfs(block, island)
            islands.append(island)

    return islands


def wire_flowchart(
    flowchart: FlowChart,
    on_publish,
    starter: Observable,
    ui_inputs: dict[str, Observable],
):
    blocks: dict[str, FCBlock] = {b.id: b for b in flowchart.blocks}
    islands = find_islands(blocks)
    block_ios: dict[str, FCBlockIO] = {}

    for island in islands:
        for block in island:

            def run_block(blk: FCBlock, kwargs: dict[str, Any]):
                fn = FUNCTIONS[blk.block_type]
                print(f"Running block {blk.id}")
                for key in FN_REQUIRED_PARAMS[blk.block_type]:
                    if key not in kwargs:
                        err = f"ERROR! Missing required param {key} for {blk.id}"
                        raise ValueError(err)
                return fn(**kwargs)

            def make_block_fn_props(
                blk: FCBlock, inputs: list[Tuple[str, Any]]
            ) -> dict[str, Any]:
                print(f"Making params for block {blk.id} with {inputs}")
                return dict(inputs)

            input_subject = Subject()
            input_subject.subscribe(
                partial(
                    lambda blk, x: print(
                        f"Input got {x} for {blk.id} regardless of zip"
                    ),
                    block,
                )
            )

            output_observable = input_subject.pipe(
                ops.map(partial(make_block_fn_props, block)),
                ops.map(partial(run_block, block)),
                ops.publish(),  # Makes it so values are not emitted on each subscribe
            )

            output_observable.subscribe(
                partial(
                    lambda blk, x: print(
                        f"Got {x} for {blk.id} after zip and transform"
                    ),
                    block,
                )
            )
            output_observable.subscribe(
                partial(lambda blk, x: on_publish(x, blk.id), block),
                on_error=lambda e: print(e),
                on_completed=lambda: print("completed"),
            )

            # Start emitting values for outputs
            output_observable.connect()

            if block.id in ui_inputs:
                print(f"Connecting {block.id} to ui input {ui_inputs[block.id]}")
                ui_inputs[block.id].subscribe(
                    input_subject.on_next,
                    input_subject.on_error,
                    input_subject.on_completed,
                )
                ui_inputs[block.id].subscribe(on_next=lambda x: print(f"Got {x} from the UI input subject") )

            block_ios[block.id] = FCBlockIO(
                block=block, i=input_subject, o=output_observable
            )

    visitedBlocks = set()

    def rec_connect_blocks(io: FCBlockIO):
        print(f"Recursively connecting {io.block.id} to its inputs")
        if (len(io.block.ins) == 0) and (io.block.id not in ui_inputs) and (io.block.block_type in EVENT_BLOCKS):
            print(f"Connected {io.block.id} to start observable with ui inputs {ui_inputs.keys()}")
            starter.subscribe(io.i.on_next, io.i.on_error, io.i.on_completed)
            return

        print(f"Connecting {io.block.id}")

        in_zip = rx.zip(
            *(
                block_ios[conn.source].o.pipe(
                    ops.map(partial(lambda param, v: (param, v), conn.targetParam))
                )
                for conn in io.block.ins
            )
        )
        print(f"Connected {io.block.id} to {io.block.ins}")

        in_zip.subscribe(io.i.on_next, io.i.on_error, io.i.on_completed)
        for conn in io.block.ins:
            print(conn)
            if conn.source in visitedBlocks:
                continue
            visitedBlocks.add(conn.source)
            rec_connect_blocks(block_ios[conn.source])

    # Connect the graph backwards starting from the terminal nodes
    terminals = filter(lambda b: not b.outs, blocks.values())
    for block in terminals:
        visitedBlocks.add(block.id)
        rec_connect_blocks(block_ios[block.id])


def main():
    sobs = Subject()

    def publish_fn(x, id):
        print(f"Publishing for id {id}")
        print(x)

    fc = FlowChart.model_validate_json(slider_fc_json)

    ui_inputs = {
        "slider1": rx.interval(1).pipe(ops.take(1000), ops.map(lambda x: [("x", x)])),
        "slider2": rx.interval(1.2).pipe(ops.take(2000), ops.map(lambda x: [("x", x)])),
    }

    wire_flowchart(
        flowchart=fc, on_publish=publish_fn, starter=sobs, ui_inputs=ui_inputs
    )

    # sobs.on_next({})
    sobs.on_next([("x", 1)])

    while True:
        pass


if __name__ == "__main__":
    main()
