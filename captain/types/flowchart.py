from pprint import pformat
from typing import Annotated, Literal, Tuple, TypeAlias, TypeVar, Union, Generic, cast

from pydantic import BaseModel, Field

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


class RFBuiltinBlockData(BaseModel):
    label: str
    block_type: BlockType
    intrinsic_parameters: dict[str, IntrinsicParameterValue] = {}


class RFFunctionInstanceData(BaseModel):
    block_type: Literal["function_instance"]
    definition_block_id: BlockID


RFBlockData = Annotated[
    Union[RFBuiltinBlockData, RFFunctionInstanceData],
    Field(discriminator="block_type"),
]

BD = TypeVar("BD", bound=RFBlockData)


class RFNode(BaseModel, Generic[BD]):
    id: BlockID
    data: BD


class RFEdge(BaseModel):
    target: BlockID
    source: BlockID
    targetHandle: RFHandleID
    sourceHandle: RFHandleID


class ReactFlow(BaseModel):
    nodes: list[RFNode[RFBlockData]]
    edges: list[RFEdge]


class FunctionDefinition(BaseModel):
    block: RFNode
    nodes: list[RFNode[RFBlockData]]
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
    def from_blocks_edges(
        blocks: list[_Block], edges: list[FCConnection], function_blocks: set[BlockID]
    ):
        block_lookup = {block.id: block for block in blocks}
        fc_blocks: dict[BlockID, FCBlock] = {}

        # TODO: This func can raise KeyError, needs more error handling logic
        # and throw a better error message.

        logger.info(f"Function blocks: \n{pformat(function_blocks)}")
        edges = join_function_edges(edges, function_blocks)

        logger.info(f"Blocks after join: \n{pformat(blocks)}")
        logger.info(f"Edges after join: \n{pformat(edges)}")

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
    def from_react_flow(
        rf: ReactFlow, function_definitions: dict[str, FunctionDefinition] | None = None
    ):
        nodes = rf.nodes
        edges = rf.edges
        logger.info(f"Function definitions: \n{pformat(function_definitions)}")
        logger.info(f"Nodes ({len(nodes)}): \n{pformat(nodes)}")
        logger.info(f"Edges ({len(edges)}): \n{pformat(edges)}")

        function_blocks = set(
            node.id
            for node in nodes
            if node.data.block_type == "flojoy.intrinsics.function"
            or node.data.block_type == "function_instance"
        )

        nodes, edges = inline_function_instances(nodes, edges, function_definitions)

        blocks = [
            _Block(
                id=n.id,
                block_type=n.data.block_type,
                intrinsic_parameters=n.data.intrinsic_parameters,
            )
            for n in nodes
        ]
        edges = [
            FCConnection(
                target=e.target,
                source=e.source,
                sourceParam=e.sourceHandle,
                targetParam=e.targetHandle,
            )
            for e in edges
        ]

        return FlowChart.from_blocks_edges(blocks, edges, function_blocks)


def inline_function_instances(
    nodes: list[RFNode[RFBlockData]],
    edges: list[RFEdge],
    function_definitions: dict[str, FunctionDefinition] | None,
) -> Tuple[list[RFNode[RFBuiltinBlockData]], list[RFEdge]]:
    if not function_definitions:
        return cast(list[RFNode[RFBuiltinBlockData]], nodes), edges

    next_nodes: list[RFNode] = []

    done_inlining = True
    for node in nodes:
        match node.data:
            case RFBuiltinBlockData():
                next_nodes.append(node)
            case RFFunctionInstanceData(definition_block_id=defn_id):
                done_inlining = False

                defn = function_definitions[defn_id]
                inlined_nodes = [
                    RFNode(id=f"{node.id}-{body_node.id}", data=body_node.data)
                    for body_node in defn.nodes
                ]
                inlined_edges = [
                    RFEdge(
                        target=f"{node.id}-{body_edge.target}"
                        if body_edge.target != defn.block.id
                        else node.id,
                        source=f"{node.id}-{body_edge.source}"
                        if body_edge.source != defn.block.id
                        else node.id,
                        targetHandle=body_edge.targetHandle,
                        sourceHandle=body_edge.sourceHandle,
                    )
                    for body_edge in defn.edges
                ]

                logger.info(f"Nodes added from inline: \n{pformat(inlined_nodes)}")
                logger.info(f"Edges added from inline: \n{pformat(inlined_edges)}")
                next_nodes.extend(inlined_nodes)
                edges.extend(inlined_edges)

    if not done_inlining:
        return inline_function_instances(next_nodes, edges, function_definitions)

    return next_nodes, edges


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
    edges: list[FCConnection], function_blocks: set[BlockID]
) -> list[FCConnection]:
    joined_edges = []
    while edges:
        e1 = edges.pop()
        src_func = e1.source in function_blocks
        dst_func = e1.target in function_blocks

        logger.info(f"Processing edge {e1}")
        logger.info(f"src_func: {src_func}")
        logger.info(f"dst_func: {dst_func}")

        if not dst_func and not src_func:
            joined_edges.append(e1)
            continue

        # join A -> in and FUNC-INTERNAL_in -> B into A -> B
        if dst_func and not e1.targetParam.startswith(INTERNAL_PREFIX):
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
            joinable = [
                e2
                for e2 in edges
                if e2.target == e1.source
                and e2.targetParam == f"{INTERNAL_PREFIX}{e1.sourceParam}"
            ]
            for e2 in joinable:
                edges.append(join_edges(e2, e1))

    return joined_edges
