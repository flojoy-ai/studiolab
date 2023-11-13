import AddBlock from '@/components/blocks/AddBlock';
import BigNumberBlock from '@/components/blocks/BigNumberBlock';
import SliderBlock from '@/components/blocks/SliderBlock';
import { SOCKET_URL } from '@/utils/constants';
import FlowControlsTopLeft from '@/components/flow/FlowControlsTopLeft';
import FlowControlsTopRight from '@/components/flow/FlowControlsTopRight';
import SmartBezierEdge from '@tisoap/react-flow-smart-edge';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowchartStore } from '@/stores/flowchart';
import { sendEvent } from '@/utils/sendEvent';
import { useShallow } from 'zustand/react/shallow';

const nodeTypes = {
  slider: SliderBlock,
  bignum: BigNumberBlock,
  add: AddBlock
};

const edgeTypes = {
  smart: SmartBezierEdge
};

const FlowCanvas = () => {
  const { sendMessage, readyState } = useWebSocket(SOCKET_URL, { share: true });
  const { edges, onEdgesChange, nodes, onNodesChange, onConnect, setRunning } = useFlowchartStore(
    useShallow((state) => ({
      setRunning: state.setRunning,
      edges: state.edges,
      onEdgesChange: state.onEdgesChange,
      nodes: state.nodes,
      onNodesChange: state.onNodesChange,
      onConnect: state.onConnect
    }))
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
  }[readyState];

  const handleStart = (): void => {
    if (connectionStatus === 'Open') {
      sendEvent(sendMessage, {
        event_type: 'start',
        rf: { nodes, edges }
      });
      setRunning(true);
    }
  };

  return (
    <ReactFlow
      nodes={nodes}
      nodeTypes={nodeTypes}
      edges={edges}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      proOptions={{ hideAttribution: true }}
      className="rounded-lg bg-background"
    >
      <FlowControlsTopLeft onStart={handleStart} />
      <FlowControlsTopRight />
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
};

export default FlowCanvas;
