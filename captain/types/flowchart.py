from pprint import pformat
from typing import Literal, TypeAlias

from pydantic import BaseModel
from captain.logging import logger

# TODO: This is hardcoded for now
BlockType = Literal[
    "flojoy.control.toggle",
    "flojoy.control.slider",
    "flojoy.visualization.big_num",
    "flojoy.visualization.progress_bar",
    "flojoy.math.arithmetic.add",
    "flojoy.math.arithmetic.subtract",
    "flojoy.math.constant",
    "flojoy.math.rand",
    "flojoy.logic.sequence",
    "flojoy.logic.clock",
    "flojoy.logic.conditional",
    "flojoy.logic.true",
    "flojoy.logic.false",
    "flojoy.visualization.bignum",
    "flojoy.intrinsics.function",
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

IntrinsicParameterValue: TypeAlias = str | int


class RFNodeData(BaseModel):
    block_type: BlockType
    intrinsic_parameters: dict[str, IntrinsicParameterValue]


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
    intrinsic_parameters: dict[str, IntrinsicParameterValue] = {}
    inputs: dict[str, str] = {}
    outputs: dict[str, str] = {}


class FCBlock(_Block):
    ins: list[FCConnection]
    outs: list[FCConnection]

    @staticmethod
    def from_block(block: _Block):
        return FCBlock(
            id=block.id,
            block_type=block.block_type,
            ins=[],
            outs=[],
            intrinsic_parameters=block.intrinsic_parameters,
        )


class FlowChart(BaseModel):
    blocks: list[FCBlock]

    @staticmethod
    def from_blocks_edges(blocks: list[_Block], edges: list[FCConnection]):
        block_lookup = {block.id: block for block in blocks}
        fc_blocks: dict[BlockID, FCBlock] = {}

        # TODO: This func can raise KeyError, needs more error handling logic
        # and throw a better error message.

        function_blocks = {
            block.id: block
            for block in blocks
            if block.block_type == "flojoy.intrinsics.function"
        }
        edges = join_function_edges(edges, function_blocks)

        for edge in edges:
            if edge.target not in fc_blocks:
                fc_blocks[edge.target] = FCBlock.from_block(block_lookup[edge.target])
            if edge.source not in fc_blocks:
                fc_blocks[edge.source] = FCBlock.from_block(block_lookup[edge.source])
            fc_blocks[edge.target].ins.append(edge)
            fc_blocks[edge.source].outs.append(edge)

        for block_id, block in block_lookup.items():
            # Erase functions at runtime
            if (
                block_id not in fc_blocks
                and block.block_type != "flojoy.intrinsics.function"
            ):
                fc_blocks[block_id] = FCBlock.from_block(block)

        return FlowChart(blocks=list(fc_blocks.values()))

    @staticmethod
    def from_react_flow(rf: ReactFlow):
        blocks = [
            _Block(
                id=n.id,
                block_type=n.data.block_type,
                intrinsic_parameters=n.data.intrinsic_parameters,
            )
            for n in rf.nodes
        ]
        print(rf.edges)
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


def join_edges(e1: FCConnection, e2: FCConnection) -> FCConnection:
    logger.info(f"Joining {e1.sourceParam} to {e2.targetParam}")
    return FCConnection(
        source=e1.source,
        target=e2.target,
        sourceParam=e1.sourceParam,
        targetParam=e2.targetParam,
    )


INTERNAL_PREFIX = "FUNC-INTERNAL_"


# TODO: Come up with a better algorithm for this
def join_function_edges(
    edges: list[FCConnection], function_blocks: dict[BlockID, _Block]
) -> list[FCConnection]:
    joined_edges = []
    while edges:
        logger.info(f"Current queue: {edges}")
        e1 = edges.pop()
        logger.info(f"Current edge: {e1}")
        src_func = function_blocks.get(e1.source)
        dst_func = function_blocks.get(e1.target)

        if dst_func is None and src_func is None:
            logger.info("Edge not touching functions, skipping join")
            joined_edges.append(e1)
            continue

        # join A -> in and FUNC-INTERNAL_in -> B into A -> B
        if dst_func and not e1.targetParam.startswith(INTERNAL_PREFIX):
            logger.info("Case 1")
            joinable = [
                e2
                for e2 in edges
                if e2.source == e1.target
                and e2.sourceParam == f"{INTERNAL_PREFIX}{e1.targetParam}"
            ]
            for e2 in joinable:
                edges.append(join_edges(e1, e2))
        # join FUNC-INTERNAL_in -> B and A -> in into A -> B
        elif src_func and e1.sourceParam.startswith(INTERNAL_PREFIX):
            logger.info("Case 2")
            param_name = e1.sourceParam.removeprefix(INTERNAL_PREFIX)
            joinable = [
                e2
                for e2 in edges
                if e2.target == e1.source and e2.targetParam == param_name
            ]
            for e2 in joinable:
                edges.append(join_edges(e2, e1))
        # join C -> FUNC-INTERNAL_out and out -> D into C -> D
        elif dst_func and e1.targetParam.startswith(INTERNAL_PREFIX):
            logger.info("Case 3")
            param_name = e1.targetParam.removeprefix(INTERNAL_PREFIX)
            joinable = [
                e2
                for e2 in edges
                if e2.source == e1.target and e2.sourceParam == param_name
            ]
            for e2 in joinable:
                edges.append(join_edges(e1, e2))
        # join out -> D and and C -> FUNC-INTERNAL_out into C -> D
        elif src_func and not e1.sourceParam.startswith(INTERNAL_PREFIX):
            logger.info("Case 4")
            joinable = [
                e2
                for e2 in edges
                if e2.target == e1.source
                and e2.targetParam == f"{INTERNAL_PREFIX}{e1.sourceParam}"
            ]
            for e2 in joinable:
                edges.append(join_edges(e2, e1))

    logger.info(joined_edges)
    return joined_edges
