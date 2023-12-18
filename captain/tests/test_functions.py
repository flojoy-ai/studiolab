import time

import pytest
from reactivex import Subject

from captain.controllers.reactive import Flow
from captain.types.flowchart import (
    INTERNAL_PREFIX,
    FlowChart,
    FunctionDefinition,
    ReactFlow,
    RFBlockData,
    RFBuiltinBlockData,
    RFEdge,
    RFFunctionInstanceData,
    RFNode,
    convert_rf_nodes_edges,
    inline_function_instances,
    join_function_edges,
)


@pytest.fixture
def basic_function_flow():
    defn = FunctionDefinition(
        block=RFNode[RFBuiltinBlockData](
            id="add_two_def",
            data=RFBuiltinBlockData(block_type="flojoy.intrinsics.function"),
        ),
        nodes=[
            RFNode[RFBlockData](
                id="const_two",
                data=RFBuiltinBlockData(
                    block_type="flojoy.math.constant",
                    intrinsic_parameters={"val": 2},
                ),
            ),
            RFNode[RFBlockData](
                id="add",
                data=RFBuiltinBlockData(
                    block_type="flojoy.math.arithmetic.add",
                ),
            ),
        ],
        edges=[
            RFEdge(
                source="add_two_def",
                target="add",
                sourceHandle=f"{INTERNAL_PREFIX}inp",
                targetHandle="x",
            ),
            RFEdge(
                source="const_two",
                target="add",
                sourceHandle="value",
                targetHandle="y",
            ),
            RFEdge(
                source="add",
                target="add_two_def",
                sourceHandle="value",
                targetHandle=f"{INTERNAL_PREFIX}out",
            ),
        ],
    )
    blocks = [
        RFNode[RFBlockData](
            id="add_two_instance",
            data=RFFunctionInstanceData(
                block_type="function_instance", definition_block_id="add_two_def"
            ),
        ),
        RFNode[RFBlockData](
            id="const_three",
            data=RFBuiltinBlockData(
                block_type="flojoy.math.constant",
                intrinsic_parameters={"val": 3},
            ),
        ),
        RFNode[RFBlockData](
            id="big_num",
            data=RFBuiltinBlockData(block_type="flojoy.visualization.big_num"),
        ),
    ]

    edges = [
        RFEdge(
            source="const_three",
            target="add_two_instance",
            sourceHandle="value",
            targetHandle="inp",
        ),
        RFEdge(
            source="add_two_instance",
            target="big_num",
            sourceHandle="out",
            targetHandle="x",
        ),
    ]
    return (blocks, edges, {"add_two_def": defn})


def test_basic_function_instance_inlining(basic_function_flow):
    nodes, edges, definitions = basic_function_flow

    nodes, edges = inline_function_instances(nodes, edges, definitions)
    assert len(nodes) == 4
    assert len(edges) == 5
    assert "add_two_instance" not in [node.id for node in nodes]

    _, cons = convert_rf_nodes_edges(nodes, edges)
    cons = join_function_edges(cons, {"add_two_def", "add_two_instance"})
    print(cons)
    assert all(
        INTERNAL_PREFIX not in e.targetParam and INTERNAL_PREFIX not in e.sourceParam
        for e in cons
    )

    assert len(cons) == 3


def test_basic_function_instance_running(basic_function_flow):
    nodes, edges, definitions = basic_function_flow
    fc = FlowChart.from_react_flow(
        ReactFlow(nodes=nodes, edges=edges), function_definitions=definitions
    )
    outputs = {}
    start_obs = Subject()

    def pub(id, x):
        print(id, x)
        outputs[id] = x

    _ = Flow(fc, pub, start_obs, publish_sample_time=0)
    start_obs.on_next({})

    time.sleep(0.5)

    assert outputs["big_num"] == 5
