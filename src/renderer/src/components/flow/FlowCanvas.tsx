import AddBlock from '@/components/blocks/AddBlock';
import BigNumberBlock from '@/components/blocks/BigNumberBlock';
import SliderBlock from '@/components/blocks/SliderBlock';
import { BlockData } from '@/types/block';
import { SOCKET_URL } from '@/utils/constants';
import FlowControlsTopLeft from '@/components/flow/FlowControlsTopLeft';
import FlowControlsTopRight from '@/components/flow/FlowControlsTopRight';
import SmartBezierEdge from '@tisoap/react-flow-smart-edge';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import ReactFlow, {
  addEdge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowchartStore } from '@/stores/flowchart';
import { sendEvent } from '@/utils/sendEvent';
import { useCallback } from 'react';

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [nodes, _, onNodesChange] = useNodesState<BlockData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const setRunning = useFlowchartStore((state) => state.setRunning);

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

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

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
