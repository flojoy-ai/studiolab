from typing import Literal
from pydantic import BaseModel

BlockType = Literal[
    "slider", "gamepad", "button", "bignum", "add", "subtract", "constant"
]


class RFNodeData(BaseModel):
    """The 'data' field of a node from React Flow."""

    block_type: BlockType


class RFNode(BaseModel):
    """A node from React Flow."""

    id: str
    data: RFNodeData


class RFEdge(BaseModel):
    """An edge from React Flow."""

    target: str
    source: str
    targetHandle: str
    sourceHandle: str


class ReactFlow(BaseModel):
    """A React Flow flow."""

    nodes: list[RFNode]
    edges: list[RFEdge]


class Block(BaseModel):
    """A Flojoy block."""

    id: str
    block_type: BlockType


class FCBlockConnection(BaseModel):
    """Internal representation of a connection between blocks."""

    target: str
    source: str
    sourceParam: str
    targetParam: str


class FCBlock(Block):
    """Internal representation of a Flojoy block."""

    ins: list[FCBlockConnection]
    outs: list[FCBlockConnection]

    @staticmethod
    def from_block(block: Block):
        return FCBlock(id=block.id, block_type=block.block_type, ins=[], outs=[])


class FlowChart(BaseModel):
    """Internal representation of a Flojoy flow chart."""

    blocks: list[FCBlock]

    @staticmethod
    def from_blocks_edges(blocks: list[Block], edges: list[FCBlockConnection]):
        lookup = {block.id: block for block in blocks}
        fc_blocks: dict[str, FCBlock] = {}

        for edge in edges:
            if edge.target not in fc_blocks:
                fc_blocks[edge.target] = FCBlock.from_block(lookup[edge.target])
            if edge.source not in fc_blocks:
                fc_blocks[edge.source] = FCBlock.from_block(lookup[edge.source])
            fc_blocks[edge.target].ins.append(edge)
            fc_blocks[edge.source].outs.append(edge)

        for block_id, block in lookup.items():
            if block_id not in fc_blocks:
                fc_blocks[block_id] = FCBlock.from_block(block)

        return FlowChart(blocks=list(fc_blocks.values()))

    @staticmethod
    def from_react_flow(rf: ReactFlow):
        blocks = [Block(id=n.id, block_type=n.data.block_type) for n in rf.nodes]
        edges = [
            FCBlockConnection(
                target=e.target,
                source=e.source,
                sourceParam=e.sourceHandle,
                targetParam=e.targetHandle,
            )
            for e in rf.edges
        ]
        return FlowChart.from_blocks_edges(blocks, edges)
