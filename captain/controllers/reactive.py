import os
from dataclasses import dataclass
from functools import partial
from typing import Any, Callable, Mapping, Tuple

import reactivex as rx
import reactivex.operators as ops
from reactivex import Observable, Subject

from captain.logging import logger
from captain.types.events import FlowUIEvent
from captain.types.flowchart import FCBlock, FlowChart
from captain.utils.blocks import is_ui_input, import_blocks

BLOCKS_DIR = os.path.join("captain", "blocks")

ZIPPED_BLOCKS = []  # TODO: I (sasha) am anti zip in all cases.


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
    ui_inputs: Mapping[str, Observable],
    block_funcs: Mapping[str, Callable],
):
    blocks: dict[str, FCBlock] = {b.id: b for b in flowchart.blocks}
    islands = find_islands(blocks)
    block_ios: dict[str, FCBlockIO] = {}

    for island in islands:
        for block in island:

            def run_block(blk: FCBlock, kwargs: dict[str, Any]):
                fn = block_funcs[blk.block_type]
                logger.debug(f"Running block {blk.id}")
                return fn(**kwargs)

            def make_block_fn_props(
                blk: FCBlock, inputs: list[Tuple[str, Any]]
            ) -> dict[str, Any]:
                logger.debug(f"Making params for block {blk.id} with {inputs}")
                return dict(inputs)

            input_subject = Subject()
            input_subject.subscribe(
                partial(
                    lambda blk, x: logger.debug(
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
                    lambda blk, x: logger.info(
                        f"Got {x} for {blk.id} after zip and transform"
                    ),
                    block,
                )
            )
            output_observable.subscribe(
                partial(lambda blk, x: on_publish(x, blk.id), block),
                on_error=lambda e: logger.debug(e),
                on_completed=lambda: logger.debug("completed"),
            )

            # Start emitting values for outputs
            output_observable.connect()

            if block.id in ui_inputs:
                logger.debug(f"Connecting {block.id} to ui input {ui_inputs[block.id]}")
                ui_inputs[block.id].subscribe(
                    input_subject.on_next,
                    input_subject.on_error,
                    input_subject.on_completed,
                )
                ui_inputs[block.id].subscribe(
                    on_next=lambda x: logger.debug(f"Got {x} from the UI input subject")
                )

            block_ios[block.id] = FCBlockIO(
                block=block, i=input_subject, o=output_observable
            )

    visitedBlocks = set()

    def rec_connect_blocks(io: FCBlockIO):
        logger.info(f"Recursively connecting {io.block.id} to its inputs")

        if not io.block.ins and io.block.id not in ui_inputs:
            logger.info(
                f"Connected {io.block.id} to start observable with ui inputs {ui_inputs.keys()}"
            )
            logger.debug(f"CREATED REACTIVE EDGE {io.block.id} -> {starter}")
            starter.subscribe(io.i.on_next, io.i.on_error, io.i.on_completed)
            return

        if len(io.block.ins) == 0 and io.block.id in ui_inputs:
            return

        logger.debug(f"Connecting {io.block.id}")

        combine_strategy = (
            rx.zip if io.block.block_type in ZIPPED_BLOCKS else rx.combine_latest
        )
        in_combined = combine_strategy(
            *(
                block_ios[conn.source].o.pipe(
                    ops.map(partial(lambda param, v: (param, v), conn.targetParam))
                )
                for conn in io.block.ins
            )
        )

        for conn in io.block.ins:
            logger.debug(
                f"CREATED REACTIVE EDGE {conn.source} -> {io.block.id} thru {'zip' if io.block.block_type in ZIPPED_BLOCKS else 'combine_latest'} via {conn.targetParam}"
            )

        in_combined.subscribe(io.i.on_next, io.i.on_error, io.i.on_completed)
        for conn in io.block.ins:
            logger.debug(conn)
            if conn.source in visitedBlocks:
                continue
            visitedBlocks.add(conn.source)
            rec_connect_blocks(block_ios[conn.source])

    # Connect the graph backwards starting from the terminal nodes
    terminals = filter(lambda b: not b.outs, blocks.values())
    for block in terminals:
        visitedBlocks.add(block.id)
        rec_connect_blocks(block_ios[block.id])


class Flow:
    flowchart: FlowChart
    ui_inputs: dict[str, Subject]

    def __init__(
        self, flowchart: FlowChart, publish_fn: Callable, start_obs: Observable
    ) -> None:
        self.flowchart = flowchart
        self.ui_inputs = {}
        funcs = import_blocks(BLOCKS_DIR)
        for block in flowchart.blocks:
            if is_ui_input(funcs[block.block_type]):
                logger.debug(f"Creating UI input for {block.id}")
                self.ui_inputs[block.id] = Subject()
        wire_flowchart(
            flowchart=self.flowchart,
            on_publish=publish_fn,
            starter=start_obs,
            ui_inputs=self.ui_inputs,
            block_funcs=funcs,
        )

    @classmethod
    def from_json(cls, data: str, publish_fn: Callable, start_obs: Observable):
        fc = FlowChart.model_validate_json(data)
        return cls(fc, publish_fn, start_obs)

    def process_ui_event(self, event: FlowUIEvent):
        self.ui_inputs[event.ui_input_id].on_next([("x", event.value)])
