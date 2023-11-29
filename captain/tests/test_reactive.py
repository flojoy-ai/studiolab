from reactivex import Subject

from captain.controllers.reactive import Flow
from captain.types.flowchart import FCConnection, FlowChart, _Block


def test_add():
    blocks = [
        _Block(id="constant1", block_type="flojoy.math.constant"),
        _Block(id="constant2", block_type="flojoy.math.constant"),
        _Block(id="add", block_type="flojoy.math.arithmetic.add"),
        _Block(id="bignum", block_type="flojoy.visualization.bignum"),
    ]

    edges = [
        FCConnection(
            target="add", source="constant1", targetParam="x", sourceParam="value"
        ),
        FCConnection(
            target="add", source="constant2", targetParam="y", sourceParam="value"
        ),
        FCConnection(
            target="bignum", source="add", targetParam="x", sourceParam="value"
        ),
    ]

    fc = FlowChart.from_blocks_edges(blocks, edges)
    outputs = {}
    start_obs = Subject()

    def pub(x, id):
        outputs[id] = x

    # TODO: Maybe we should do something like flow.wire() to trigger the
    # wire process instead of doing it upon construction?
    flow = Flow(fc, pub, start_obs)
    start_obs.on_next({})

    assert outputs["constant1"] == 2
    assert outputs["constant2"] == 2
    assert outputs["add"] == 4
    assert outputs["bignum"] == 4
