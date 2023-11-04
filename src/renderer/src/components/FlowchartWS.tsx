import { useCallback } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Button } from './ui/Button';
import { Separator } from './ui/Separator';
import ReactFlow, { useEdgesState, useNodesState, addEdge } from 'reactflow';
import 'reactflow/dist/style.css';
import { FlowSocketMessage } from '@/types/flow';
import { SOCKET_URL } from '@/utils/constants';
import { useUpdateBlockState } from '@/hooks/useBlockState';
import { BlockData, BlockType } from '@/types/block';
import { v4 as uuidv4 } from 'uuid';
import SliderBlock from './blocks/SliderBlock';
import BigNumberBlock from './blocks/BigNumberBlock';
import AddBlock from './blocks/AddBlock';

const nodeTypes = {
  slider: SliderBlock,
  bignum: BigNumberBlock,
  add: AddBlock
};

export const FlowchartWS = () => {
  const { sendMessage, lastMessage, readyState } = useWebSocket(SOCKET_URL, { share: true });
  const [nodes, setNodes, onNodesChange] = useNodesState<BlockData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useUpdateBlockState();

  console.log(nodes, edges);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
  }[readyState];

  const sendSocketEvent = (message: FlowSocketMessage['event']): void => {
    sendMessage(JSON.stringify({ event: message }));
  };

  const handleStart = (): void => {
    if (connectionStatus === 'Open') {
      sendSocketEvent({
        event_type: 'start',
        rf: { nodes, edges }
      });
    }
  };

  // const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
  //   if (!event.target.files) {
  //     return;
  //   }
  //
  //   const file = event.target.files[0];
  //   const reader = new FileReader();
  //   reader.onload = (event): void => {
  //     if (!event.target?.result) {
  //       throw new Error('Failed to read uploaded JSON file.');
  //     }
  //     const text = event.target.result.toString();
  //     setFlowchart(JSON.parse(text));
  //   };
  //
  //   reader.readAsText(file, 'UTF-8');
  // };

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
      {/* <input type="file" accept={'.json'} onChange={handleFileUpload}></input> */}
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
