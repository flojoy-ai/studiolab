from typing import List, Literal, Tuple, Any
from pydantic import BaseModel
import reactivex as rx
from reactivex import Observable
from reactivex.subject import BehaviorSubject
import reactivex.operators as ops
import itertools

FLOWCHART = '{"blocks":[{"id":"0","block":"slider","ins":[],"outs":[{"target":"2","source":"1","sourceParam":"value","targetParam":"first"}]},{"id":"1","block":"slider","ins":[],"outs":[{"target":"2","source":"1","sourceParam":"value","targetParam":"second"}]},{"id":"2","block":"add","ins":[{"target":"2","source":"1","sourceParam":"value","targetParam":"first"},{"target":"2","source":"0","sourceParam":"value","targetParam":"second"}],"outs":[{"target":"3","source":"2","sourceParam":"value","targetParam":"value"}]},{"id":"3","block":"bignum","ins":[{"target":"3","source":"2","sourceParam":"value","targetParam":"value"}],"outs":[]},{"id":"Island2","block":"gamepad","ins":[],"outs":[]}]}'


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
    return x


def gamepad(x):
    print(f"gamepad: {x}")
    return x


def button(x: bool):
    print(f"button: {x}")
    return x


def bignum(x):
    print(f"bignum: {x}")
    return x


def add(x, y):
    print(f"add: {x} + {y}")
    return x + y


def subtract(x, y):
    print(f"subtract: {x} - {y}")
    return x - y


FUNCTIONS = {
    "slider": slider,
    "gamepad": gamepad,
    "button": button,
    "bignum": bignum,
    "add": add,
    "subtract": subtract,
}


def build_flowchart(
    fc_json: str, start_observable: BehaviorSubject, publish_fn=lambda x: None
):
    fc = FlowChart.model_validate_json(fc_json)

    blocks = {block.id: block for block in fc.blocks}
    islands = find_islands(blocks)

    all_subjects = {}
    graph_subjects = [
        build_graph(blocks, island, subjects=all_subjects) for island in islands
    ]

    in_subjects = [inp for blk, inp, outp in all_subjects.values() if len(blk.ins) == 0]

    def call_all_ins(x):
        for subj in in_subjects:
            # TODO: Figure out a better start value
            if x is None:
                print("No value")
            else:
                subj.on_next(x)

    start_observable.subscribe(on_next=call_all_ins)

    for blk, inp, out in itertools.chain(*graph_subjects):
        out.subscribe(on_next=lambda x: publish_fn((x, blk)))

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
            # TODO: deliberate node input type with flag for first run
            input: BehaviorSubject[Any] = BehaviorSubject(None)
            input.subscribe(on_next=lambda x: print(f"Got {x} for {block.id}"))
            output = input.pipe(ops.map(lambda x: FUNCTIONS[block.block](**x)))
            output.subscribe(on_next=print)
            subjects[block.id] = (block, input, output)
        else:
            _, input, output = tup

        if len(block.ins) == 0:
            return block, input, output

        in_subjects = [
            rec_build_graph(blocks[edge.source])[1].pipe(
                ops.map(lambda x: (edge.targetParam, getattr(x, edge.sourceParam)))
            )
            for edge in block.ins
        ]
        zipped_in = rx.zip(*in_subjects).pipe(
            ops.map(lambda ins: {param: sub for param, sub in ins})
        )
        zipped_in.subscribe(on_next=lambda x: input.on_next(x))
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
