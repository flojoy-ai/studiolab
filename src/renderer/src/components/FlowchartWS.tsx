import { useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Button } from './ui/Button';
import { Separator } from './ui/Separator';
import ReactFlow, { useEdgesState, useNodesState, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { SOCKET_URL } from '@/utils/constants';
import { BlockData, BlockType } from '@/types/block';
import { v4 as uuidv4 } from 'uuid';
import SliderBlock from './blocks/SliderBlock';
import BigNumberBlock from './blocks/BigNumberBlock';
import AddBlock from './blocks/AddBlock';
import { useFlowchartStore } from '@/hooks/useFlowchartStore';
import { sendEvent } from '@/utils/sendEvent';

const nodeTypes = {
  slider: SliderBlock,
  bignum: BigNumberBlock,
  add: AddBlock
};

export const FlowchartWS = () => {
  const { sendMessage, lastMessage, readyState } = useWebSocket(SOCKET_URL, { share: true });
  const [nodes, setNodes, onNodesChange] = useNodesState<BlockData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const runFlow = useFlowchartStore((state) => state.runFlow);

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
      runFlow();
    }
  };

  const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);

  const addNode = (block_type: BlockType) => {
    return () => {
      setNodes(
        nodes.concat([
          {
            id: `${block_type}-${uuidv4()}`,
            position: { x: Math.random() * 30 - 15, y: Math.random() * 30 - 15 },
            type: block_type,
            data: {
              label: block_type,
              block_type
            }
          }
        ])
      );
    };
  };

  const handleAddSlider = addNode('slider');
  const handleAddAdd = addNode('add');
  const handleAddBigNumber = addNode('bignum');

  return (
    <div>
      <span>The WebSocket is currently {connectionStatus}</span>
      {lastMessage ? <span> | Last message: {lastMessage.data}</span> : null}
      <Separator />
      <Button onClick={handleStart} disabled={readyState !== ReadyState.OPEN || nodes.length === 0}>
        Start Flowchart
      </Button>
      <Button variant="ghost" onClick={handleAddSlider}>
        Add Slider
      </Button>
      <Button variant="ghost" onClick={handleAddAdd}>
        Add Add
      </Button>
      <Button variant="ghost" onClick={handleAddBigNumber}>
        Add Big Number
      </Button>
      <Separator />
      <div className="w-screen" style={{ height: 800 }}>
        <ReactFlow
          nodes={nodes}
          nodeTypes={nodeTypes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
        />
      </div>
    </div>
  );
};
