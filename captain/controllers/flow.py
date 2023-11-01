from typing import List, Literal, Tuple
from pydantic import BaseModel
import reactivex as rx
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
    block: Literal['slider','gamepad','button','bignum','add','subtract']
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
    'slider': slider,
    'gamepad': gamepad,
    'button': button,
    'bignum': bignum,
    'add': add,
    'subtract': subtract,
}

def build_flowchart(fc_json: str, start_observable: BehaviorSubject):
    fc = FlowChart.model_validate_json(fc_json)

    blocks = {block.id: block for block in fc.blocks}
    islands = find_islands(blocks)

    all_subjects = {}
    graph_subjects = [build_graph(blocks, island, all_subjects) for island in islands]

    in_subjects = [sub for blk, sub in itertools.chain(*graph_subjects) if len(blk.ins) == 0]

    def call_all_ins(_):
        for subj in in_subjects:
            # TODO: Figure out a better start value
            subj.on_next(None)

    start_observable.subscribe(on_next=call_all_ins)
    return graph_subjects

def build_graph(blocks: dict[str, FCBlock], island: list[FCBlock], subjects: dict[str, BehaviorSubject]):
    terminals = list(filter(lambda b: len(b.outs) == 0, island))

    def rec_build_graph(block: FCBlock) -> Tuple[FCBlock, rx.Observable]:
        subject = subjects.get(block.id)
        if subject is None:
            subject = BehaviorSubject(None)


        if len(block.ins) == 0:
            return (block, subject)

        in_subjects = [
            rec_build_graph(blocks[edge.source])[1].pipe(ops.map(lambda x: (edge.targetParam, getattr(x, edge.sourceParam))))
            for edge in block.ins
        ]
        zipped_in = rx.zip(*in_subjects).pipe(ops.map(lambda ins: {param: sub for param, sub in ins}))
        zipped_in.subscribe(on_next = subject.on_next)
        return (block, subject)
    return [rec_build_graph(term) for term in terminals]


def find_islands(blocks: dict[str, FCBlock]):
    def dfs(block: FCBlock, visited: set[str], island: list[FCBlock]):
        visited.add(block.id)
        island.append(block)
        for connection in [i.source for i in block.ins] + [o.target for o in block.outs]:
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
    build_flowchart(FLOWCHART)

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
