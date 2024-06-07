from reactivex import Subject

from captain.controllers.reactive import Flow
from captain.types.flowchart import FCConnection, FlowChart, _Block
import time


def test_add():
    blocks = [
        _Block(
            id="constant1",
            block_type="flojoy.math.constant",
            intrinsic_parameters={"val": 2},
        ),
        _Block(
            id="constant2",
            block_type="flojoy.math.constant",
            intrinsic_parameters={"val": 2},
        ),
        _Block(id="add", block_type="flojoy.math.arithmetic.add"),
        _Block(id="big_num", block_type="flojoy.visualization.big_num"),
    ]

    edges = [
        FCConnection(
            target="add", source="constant1", targetParam="x", sourceParam="value"
        ),
        FCConnection(
            target="add", source="constant2", targetParam="y", sourceParam="value"
        ),
        FCConnection(
            target="big_num", source="add", targetParam="x", sourceParam="value"
        ),
    ]

    fc = FlowChart.from_blocks_edges(blocks, edges, set())
    outputs = {}
    start_obs = Subject()

    def pub(id, x):
        outputs[id] = x

    # TODO: Maybe we should do something like flow.wire() to trigger the
    # wire process instead of doing it upon construction?
    _ = Flow(fc, pub, start_obs, publish_sample_time=0)
    start_obs.on_next({})

    time.sleep(0.5)
    print(outputs)

    assert outputs["constant1"] == 2
    assert outputs["constant2"] == 2
    assert outputs["add"] == 4
    assert outputs["big_num"] == 4
