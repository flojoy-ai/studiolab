from typing import Literal, TypeAlias

from pydantic import BaseModel

# TODO: This is hardcoded for now
BlockType = Literal[
    "flojoy.control.slider",
    "flojoy.visualization.bignum",
    "flojoy.math.arithmetic.add",
    "flojoy.math.arithmetic.subtract",
    "flojoy.math.constant",
]

BlockID: TypeAlias = str

"""
Everything related to ReactFlow
"""

# This ID is defined in the Handle component in ReactFlow
# if the block function takes x and y as inputs, then the Handle
# should also match the same name!
# TODO: Fix this later to make sure the handle ID is generated from the block's
# input param name and output param name.
RFHandleID: TypeAlias = str


class RFNodeData(BaseModel):
    block_type: BlockType


class RFNode(BaseModel):
    id: BlockID
    data: RFNodeData


class RFEdge(BaseModel):
    target: BlockID
    source: BlockID
    targetHandle: RFHandleID
    sourceHandle: RFHandleID


class ReactFlow(BaseModel):
    nodes: list[RFNode]
    edges: list[RFEdge]


"""
Flojoy specific flowchart types
"""

FCIOParamName: TypeAlias = RFHandleID


class FCConnection(BaseModel):
    target: BlockID
    source: BlockID
    sourceParam: FCIOParamName
    targetParam: FCIOParamName


class _Block(BaseModel):
    """
    This Block class should NOT be used directly besides for testing.
    It exists such that it is easier to write test without repeating
    the ins and outs fields for each block as they can be computed.
    """

    id: BlockID
    block_type: BlockType


class FCBlock(_Block):
    ins: list[FCConnection]
    outs: list[FCConnection]

    @staticmethod
    def from_block(block: _Block):
        return FCBlock(id=block.id, block_type=block.block_type, ins=[], outs=[])


class FlowChart(BaseModel):
    blocks: list[FCBlock]

    @staticmethod
    def from_blocks_edges(blocks: list[_Block], edges: list[FCConnection]):
        block_lookup = {block.id: block for block in blocks}
        fc_blocks: dict[BlockID, FCBlock] = {}

        # TODO: This func can raise KeyError, needs more error handling logic
        # and throw a better error message.

        for edge in edges:
            if edge.target not in fc_blocks:
                fc_blocks[edge.target] = FCBlock.from_block(block_lookup[edge.target])
            if edge.source not in fc_blocks:
                fc_blocks[edge.source] = FCBlock.from_block(block_lookup[edge.source])
            fc_blocks[edge.target].ins.append(edge)
            fc_blocks[edge.source].outs.append(edge)

        for block_id, block in block_lookup.items():
            if block_id not in fc_blocks:
                fc_blocks[block_id] = FCBlock.from_block(block)

        return FlowChart(blocks=list(fc_blocks.values()))

    @staticmethod
    def from_react_flow(rf: ReactFlow):
        blocks = [_Block(id=n.id, block_type=n.data.block_type) for n in rf.nodes]
        edges = [
            FCConnection(
                target=e.target,
                source=e.source,
                sourceParam=e.sourceHandle,
                targetParam=e.targetHandle,
            )
            for e in rf.edges
        ]
        return FlowChart.from_blocks_edges(blocks, edges)
