from typing import Literal, TypeAlias

from pydantic import BaseModel

BlockType = Literal[
    "slider", "gamepad", "button", "bignum", "add", "subtract", "constant"
]

BlockID: TypeAlias = str


class RFNodeData(BaseModel):
    block_type: BlockType


class RFNode(BaseModel):
    id: BlockID
    data: RFNodeData


class RFEdge(BaseModel):
    target: BlockID
    source: BlockID
    targetHandle: str
    sourceHandle: str


class ReactFlow(BaseModel):
    nodes: list[RFNode]
    edges: list[RFEdge]


class FCBlockConnection(BaseModel):
    target: str
    source: str
    sourceParam: str
    targetParam: str


class Block(BaseModel):
    id: str
    block_type: BlockType


class FCBlock(Block):
    ins: list[FCBlockConnection]
    outs: list[FCBlockConnection]

    @staticmethod
    def from_block(block: Block):
        return FCBlock(id=block.id, block_type=block.block_type, ins=[], outs=[])


class FlowChart(BaseModel):
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
