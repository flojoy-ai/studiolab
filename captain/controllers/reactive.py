import os
from dataclasses import dataclass
from functools import partial
from typing import Any, Callable, Mapping, Tuple

import reactivex as rx
import reactivex.operators as ops
from reactivex import Observable, Subject

from captain.logging import logger
from captain.types.events import FlowControlEvent
from captain.types.flowchart import BlockID, BlockType, FCBlock, FlowChart
from captain.utils.blocks import import_blocks, is_ui_input

BLOCKS_DIR = os.path.join("blocks")


@dataclass
class FCBlockIO:
    """Represents a Flojoy block with a single input subject and output observable.

    Input parameters are represented with a list of name/value pairs.
    Output values are represented with a single value or TypedDict.
    """

    block: FCBlock
    i: Subject
    o: Observable


def find_islands(blocks: dict[str, FCBlock]) -> list[list[FCBlock]]:
    """Finds all of the connected components (islands) in the flow chart.

    Parameters
    ----------
    blocks
        The list of blocks in the flow chart.

    Returns
    -------
    list[list[FCBlock]]
        A list of the islands.
        Each list represents the blocks that make up a island.
    """
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
    on_publish: Callable,
    starter: Observable,
    ui_inputs: Mapping[BlockID, Observable],
    block_funcs: Mapping[BlockType, Callable],
):
    """Connects all of block functions in a flow chart using RxPY.

    To run the flow chart, push an item to the start observable.

    Parameters
    ----------
    flowchart
        The flow chart to connect together.
    on_publish
        A function that will be called every time a block function is run.
    starter
        An observable that blocks with no inputs will be subscribed to.
        The flowchart will be run from the start every time this observable emits an item.
    ui_inputs
        Observables for each of the UI inputs in the flow chart.
    block_funcs
        Preimported functions for each block type.
    """

    blocks: dict[BlockID, FCBlock] = {b.id: b for b in flowchart.blocks}
    islands = find_islands(blocks)
    block_ios: dict[BlockID, FCBlockIO] = {}

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

            # A lot of the lambdas being passed created are partially applied,
            # this is because Python has weird late binding with lambdas in a loop.
            # Instead of using captured values, we need to pass it as a parameter
            # so that it binds to the value and not the name.

            input_subject = Subject()
            input_subject.subscribe(
                on_next=partial(
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
                    lambda blk, x: logger.debug(
                        f"Got {x} for {blk.id} after zip and transform"
                    ),
                    block,
                )
            )
            output_observable.subscribe(
                on_next=partial(lambda blk, x: on_publish(x, blk.id), block),
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

    visited_blocks: set[BlockID] = set()

    def rec_connect_blocks(io: FCBlockIO):
        """Combines each input edge of a block into a single observable, until a block with no inputs is reached.

        Blocks with no inputs are subscribed to the start observable.

        """
        logger.info(
            f"Recursively connecting {io.block.block_type}({io.block.id}) to its inputs"
        )

        if not io.block.ins and io.block.id not in ui_inputs:
            logger.info(
                f"Connected {io.block.id} to start observable with ui inputs {ui_inputs.keys()}"
            )
            logger.debug(f"CREATED REACTIVE EDGE {io.block.id} -> {starter}")
            starter.subscribe(io.i.on_next, io.i.on_error, io.i.on_completed)
            return

        if not io.block.ins and io.block.id in ui_inputs:
            return

        logger.debug(f"Connecting {io.block.id}")

        # combines every input for a block into a single observable.
        in_combined = rx.combine_latest(
            *(
                block_ios[conn.source].o.pipe(
                    ops.map(partial(lambda param, v: (param, v), conn.targetParam))
                )
                for conn in io.block.ins
            )
        )

        for conn in io.block.ins:
            logger.debug(
                f"CREATED REACTIVE EDGE {conn.source} -> {io.block.id} thru 'combine_latest' via {conn.targetParam}"
            )

        in_combined.subscribe(io.i.on_next, io.i.on_error, io.i.on_completed)
        for conn in io.block.ins:
            logger.debug(conn)
            if conn.source in visited_blocks:
                continue
            visited_blocks.add(conn.source)
            rec_connect_blocks(block_ios[conn.source])

    # Connect the graph backwards starting from the terminal nodes
    terminals = filter(lambda b: not b.outs, blocks.values())
    for block in terminals:
        visited_blocks.add(block.id)
        rec_connect_blocks(block_ios[block.id])


class Flow:
    """Represents a currently running flow.

    The flowchart is immediately started upon creation.
    """

    flowchart: FlowChart
    control_blocks: dict[BlockID, Subject]

    def __init__(
        self, flowchart: FlowChart, publish_fn: Callable, start_obs: Observable
    ) -> None:
        self.flowchart = flowchart
        self.control_blocks = {}

        funcs = import_blocks(BLOCKS_DIR)

        for block in flowchart.blocks:
            if is_ui_input(funcs[block.block_type]):
                logger.debug(f"Creating UI input for {block.id}")
                self.control_blocks[block.id] = Subject()

        wire_flowchart(
            flowchart=self.flowchart,
            on_publish=publish_fn,
            starter=start_obs,
            ui_inputs=self.control_blocks,
            block_funcs=funcs,
        )

    @staticmethod
    def from_json(data: str, publish_fn: Callable, start_obs: Observable):
        fc = FlowChart.model_validate_json(data)
        return Flow(fc, publish_fn, start_obs)

    def process_ui_event(self, event: FlowControlEvent):
        self.control_blocks[event.block_id].on_next([("x", event.value)])
