from dataclasses import dataclass
from functools import partial
from typing import Any, Callable, Mapping, Tuple, is_typeddict

import reactivex as rx
import reactivex.operators as ops
from reactivex import Observable, Subject
from reactivex.abc import DisposableBase, SchedulerBase
from reactivex.scheduler import ThreadPoolScheduler

from captain.lib.block_import import FlojoyBlock, import_blocks
from captain.logging import logger
from captain.types.builtins import Ignore
from captain.types.events import FlowControlEvent
from captain.types.flowchart import BlockID, BlockType, FCBlock, FlowChart

BLOCKS_DIR = "blocks"


@dataclass
class FCBlockIO:
    """Represents a Flojoy block with a single input subject and output observable.

    Input parameters are represented with a list of name/value pairs.
    Output values are represented with a single value or TypedDict.
    """

    block: FCBlock
    input_subject: Subject
    output_observables: Mapping[str, Observable]


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


class Flow:
    """Represents a currently running flow.

    The flowchart is immediately started upon creation.

    To run the flow chart, push an item to the start observable.

    Fields
    ------
    flowchart
        The flow chart to run.
    on_publish
        A function that will be called every time a block function is run.
    starter
        An observable that blocks with no inputs will be subscribed to.
        The flowchart will be run from the start every time this observable emits an item.
    publish_scheduler
        The RxPY scheduler to use for the publish function
    """

    flowchart: FlowChart
    control_subjects: dict[BlockID, Subject]

    def __init__(
        self,
        flowchart: FlowChart,
        publish_fn: Callable[[BlockID, Any], None],
        start_obs: Observable,
        publish_scheduler: SchedulerBase | None = None,
    ) -> None:
        self.flowchart = flowchart
        self.control_subjects = {}
        self.on_publish = publish_fn
        self.start_obs = start_obs
        self.publish_scheduler = publish_scheduler

        funcs = import_blocks(BLOCKS_DIR)

        for block in flowchart.blocks:
            if funcs[block.block_type].is_ui_input:
                logger.info(
                    f"Creating a Subject for {block.block_type}({block.id}) to react to changes."
                )
                self.control_subjects[block.id] = Subject()

        self.subscriptions = self.connect(block_funcs=funcs)

    @staticmethod
    def from_json(data: str, publish_fn: Callable, start_obs: Observable):
        fc = FlowChart.model_validate_json(data)
        return Flow(fc, publish_fn, start_obs)

    def process_ui_event(self, event: FlowControlEvent):
        self.control_subjects[event.block_id].on_next([("x", event.value)])

    def destroy(self):
        for sub in self.subscriptions:
            sub.dispose()

    def connect(
        self,
        block_funcs: Mapping[BlockType, FlojoyBlock],
        publish_sample_time: float = 1 / 30,
    ):
        """Connects all of block functions in a flow chart using RxPY.

        To run the flow chart, push an item to the start observable.

        Parameters
        ----------
        block_funcs
            Preimported FlojoyBlocks for each block type.
        """
        blocks: dict[str, FCBlock] = {b.id: b for b in self.flowchart.blocks}
        islands = find_islands(blocks)
        block_ios: dict[str, FCBlockIO] = {}

        subscriptions: list[DisposableBase] = []

        for island in islands:
            for block in island:
                # input_subject is the subject that will be used to push values to the block
                # output_observable is the observable that will be used to get values from the block
                input_subject = Subject()

                # TODO: should probably have a debug toggle in settings
                # to turn on/off debugging and we can guard debug statements with that
                input_subject.subscribe(
                    partial(
                        lambda blk, x: logger.info(
                            f"Input got {x} for {blk.block_type} ({blk.id}) regardless of zip"
                        ),
                        block,
                    ),
                    on_error=lambda e: logger.error(e),
                )

                fj_block = block_funcs[block.block_type]

                # A lot of the lambdas being passed created are partially applied,
                # this is because Python has weird late binding with lambdas in a loop.
                # Instead of using captured values, we need to pass it as a parameter
                # so that it binds to the value and not the name.
                #
                def run_block(blk: FCBlock, kwargs: dict[str, Any]):
                    fn = block_funcs[blk.block_type]
                    logger.info(f"Running block {blk.block_type} ({blk.id})")
                    res = fn(**kwargs)
                    match res:
                        case Observable():
                            return res
                        case _:
                            return rx.just(res)

                def make_block_fn_props(
                    blk: FCBlock, inputs: list[Tuple[str, Any]]
                ) -> dict[str, Any]:
                    logger.info(
                        f"Making params for block {blk.block_type} ({blk.id}) with {inputs}"
                    )
                    return dict(inputs) | blk.intrinsic_parameters

                output_observable = input_subject.pipe(
                    # run concurrently so the loop doesn't block everything
                    ops.map(partial(make_block_fn_props, block)),
                    ops.flat_map(partial(run_block, block)),
                    ops.filter(lambda x: not isinstance(x, Ignore)),
                    ops.observe_on(ThreadPoolScheduler()),
                    # Makes it so values are not emitted on each subscribe
                    ops.publish(),
                )

                disposable = output_observable.subscribe(
                    partial(
                        lambda blk, x: logger.info(
                            f"Got {x} for {blk.block_type} ({blk.id}) after zip and transform"
                        ),
                        block,
                    ),
                    on_error=lambda e: logger.error(e),
                )  # for logging purpose only
                subscriptions.append(disposable)

                # Split blocks that return multiple things into individual observables
                if is_typeddict(fj_block.output):
                    output_observables = {
                        name: output_observable.pipe(
                            ops.pluck(name),
                            ops.filter(lambda x: not isinstance(x, Ignore)),
                        )
                        for name in fj_block.output.__annotations__
                    }
                else:
                    output_observables = {"value": output_observable}

                # TODO: Figure out what to publish when a block returns multiple values
                # Current solution is just to publish the first value only
                debounced = next(iter(output_observables.values())).pipe(
                    ops.sample(publish_sample_time, self.publish_scheduler),
                )

                disposable = debounced.subscribe(
                    partial(lambda blk, x: self.on_publish(blk.id, x), block),
                    on_error=lambda e: logger.error(e),
                )  # this is to stream data back to the client
                subscriptions.append(disposable)

                # Start emitting values for outputs
                output_observable.connect()

                if block.id in self.control_subjects:
                    logger.debug(
                        f"Connecting {block.block_type} ({block.id}) to ui input {self.control_subjects[block.id]}"
                    )
                    disposable = self.control_subjects[block.id].subscribe(
                        input_subject.on_next,
                        input_subject.on_error,
                        input_subject.on_completed,
                    )
                    subscriptions.append(disposable)
                    disposable = self.control_subjects[block.id].subscribe(
                        on_next=lambda x: logger.debug(
                            f"Got {x} from the UI input subject"
                        )
                    )
                    subscriptions.append(disposable)

                block_ios[block.id] = FCBlockIO(
                    block=block,
                    input_subject=input_subject,
                    output_observables=output_observables,
                )

        visited_blocks = set()

        def rec_connect_blocks(io: FCBlockIO):
            logger.info(
                f"Recursively connecting {io.block.block_type} ({io.block.id}) to its inputs"
            )

            if not io.block.ins and io.block.id not in self.control_subjects:
                logger.debug(
                    f"Connected {io.block.id} to start observable with ui inputs {list(self.control_subjects.keys())}"
                )
                logger.debug(f"CREATED REACTIVE EDGE {io.block.id} -> {self.start_obs}")
                disposable = self.start_obs.subscribe(
                    io.input_subject.on_next,
                    io.input_subject.on_error,
                    io.input_subject.on_completed,
                )
                subscriptions.append(disposable)
                return

            if not io.block.ins and io.block.id in self.control_subjects:
                return

            logger.debug(f"Connecting {io.block.id}")

            # combines every input for a block into a single observable.
            in_combined = rx.combine_latest(
                *(
                    block_ios[conn.source]
                    .output_observables[conn.sourceParam]
                    .pipe(
                        ops.map(partial(lambda param, v: (param, v), conn.targetParam))
                    )
                    for conn in io.block.ins
                )
            )

            for conn in io.block.ins:
                logger.debug(
                    f"CREATED REACTIVE EDGE {conn.source} -> {io.block.id} via {conn.targetParam}"
                )

            disposable = in_combined.subscribe(
                io.input_subject.on_next,
                io.input_subject.on_error,
                io.input_subject.on_completed,
            )
            subscriptions.append(disposable)
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

        return subscriptions
