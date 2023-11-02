from dataclasses import dataclass
from types import NoneType
from typing import List, Literal, Any, Tuple

from pydantic import BaseModel
import reactivex as rx
from reactivex import Observable
from reactivex.subject import BehaviorSubject
import reactivex.operators as ops
from functools import partial

fc_json = """
{
  "blocks": [
    {
      "block_type": "constant",
      "id": "constant1",
      "ins": [],
      "outs": [
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


# @dataclass
# class FCBlockFnProps:  # TODO: use typed dict for kwargs
#     is_init: bool = False
#     kwargs: dict[str, Any] = None
#     const_value: Any = None


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
    print("constant: 2")
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

INITIAL_DUMMY_INPUT = None
InitialInput = NoneType


class FCBlockConnection(BaseModel):
    target: str
    source: str
    sourceParam: str
    targetParam: str


class FCBlock(BaseModel):
    id: str
    block_type: Literal[
        "slider", "gamepad", "button", "bignum", "add", "subtract", "constant"
    ]
    ins: List[FCBlockConnection]
    outs: List[FCBlockConnection]


class FlowChart(BaseModel):
    blocks: List[FCBlock]


@dataclass
class FCBlockIO:
    block: FCBlock
    i: BehaviorSubject
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
    starter: Observable | BehaviorSubject,
    ui_inputs: dict[str, BehaviorSubject | Observable],
):
    blocks: dict[str, FCBlock] = {b.id: b for b in flowchart.blocks}
    islands = find_islands(blocks)
    block_ios: dict[str, FCBlockIO] = {}

    for island in islands:
        for block in island:

            def run_block(blk: FCBlock, kwargs: dict[str, Any] | None):
                fn = FUNCTIONS[blk.block_type]
                print(f"Running block {blk.id}")
                if kwargs is None:
                    print("Received None for input (initial value), returning None")
                    return
                return fn(**kwargs)

            def make_block_fn_props(
                blk: FCBlock, inputs: list[Tuple[str, Any]] | None
            ) -> dict[str, Any] | None:
                print(f"Making params for block {blk.id} with {inputs}")
                if inputs is None:
                    print("Received None for input (initial value), returning None")
                    return inputs
                return dict(inputs)

            input_subject = BehaviorSubject(None)
            input_subject.subscribe(
                partial(
                    lambda blk, x: print(
                        f"Input got {x} for {blk.id} regardless of zip"
                    ),
                    block,
                )
            )

            # TODO: Use ops.skip?
            output_observable = input_subject.pipe(
                ops.skip(1),  # ignore initial starting value
                ops.map(partial(make_block_fn_props, block)),
                ops.map(partial(run_block, block)),
            )
            # if block.block.id in ui_inputs:
            #     ui_inputs[block.block.id].subscribe(
            #         block.i.on_next, block.i.on_error, block.i.on_completed
            #     )

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

            block_ios[block.id] = FCBlockIO(
                block=block, i=input_subject, o=output_observable
            )

    vistedConns = set()

    def rec_connect_blocks(io: FCBlockIO):
        print(f"Recursively connecting {io.block.id} to its inputs")
        if len(io.block.ins) == 0:
            print(f"Connected {io.block.id} to start observable")
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
            if conn.source + conn.target in vistedConns:
                continue
            vistedConns.add(conn.source + conn.target)
            rec_connect_blocks(block_ios[conn.source])

    # Connect the graph backwards starting from the terminal nodes
    terminals = filter(lambda b: not b.outs, blocks.values())
    for block in terminals:
        rec_connect_blocks(block_ios[block.id])


def main():
    sobs = BehaviorSubject({})

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
        "slider1": rx.interval(1).pipe(ops.take(1000)),
        "slider2": rx.interval(1.2).pipe(ops.take(2000)),
    }

    wire_flowchart(
        flowchart=fc, on_publish=publish_fn, starter=sobs, ui_inputs=ui_inputs
    )

    # sobs.on_next(21)

    # while True:
    #     pass

    # incrememnt sliders by 1 per second


if __name__ == "__main__":
    main()
