from reactivex import Subject
from captain.types.flowchart import Block, FCBlockConnection, FlowChart
from captain.controllers.reactive import Flow


def test_add():
    blocks = [
        Block(id="constant1", block_type="constant"),
        Block(id="constant2", block_type="constant"),
        Block(id="add", block_type="add"),
        Block(id="bignum", block_type="bignum"),
    ]

    edges = [
        FCBlockConnection(
            target="add", source="constant1", targetParam="x", sourceParam="value"
        ),
        FCBlockConnection(
            target="add", source="constant2", targetParam="y", sourceParam="value"
        ),
        FCBlockConnection(
            target="bignum", source="add", targetParam="x", sourceParam="value"
        ),
    ]

    fc = FlowChart.from_blocks_edges(blocks, edges)
    outputs = {}
    start_obs = Subject()

    def pub(x, id):
        outputs[id] = x

    flow = Flow(fc, pub, start_obs)
    start_obs.on_next({})

    assert outputs["constant1"] == 2
    assert outputs["constant2"] == 2
    assert outputs["add"] == 4
    assert outputs["bignum"] == 4
