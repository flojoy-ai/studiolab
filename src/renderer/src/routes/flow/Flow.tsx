import AddBlock from '@/components/blocks/AddBlock';
import BigNumberBlock from '@/components/blocks/BigNumberBlock';
import SliderBlock from '@/components/blocks/SliderBlock';
import BlockCard from '@/components/flow/BlockCard';
import { BlockData, BlockType } from '@/types/block';
import { SOCKET_URL } from '@/utils/constants';
import FlowControlsTopLeft from '@/components/flow/FlowControlsTopLeft';
import FlowControlsTopRight from '@/components/flow/FlowControlsTopRight';
import { UIState, useUIStateStore } from '@/stores/ui';
import { cn } from '@/utils/style';
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
import { v4 as uuidv4 } from 'uuid';

const nodeTypes = {
  slider: SliderBlock,
  bignum: BigNumberBlock,
  add: AddBlock
};

const edgeTypes = {
  smart: SmartBezierEdge
};
import { useShallow } from 'zustand/react/shallow';

const Flow = (): JSX.Element => {
  const { sendMessage, readyState } = useWebSocket(SOCKET_URL, { share: true });
  const [nodes, setNodes, onNodesChange] = useNodesState<BlockData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const setRunning = useFlowchartStore((state) => state.setRunning);
  const { isBlocksLibraryActive } = useUIStateStore(
    useShallow((state: UIState) => ({
      isBlocksLibraryActive: state.isBlocksLibraryActive
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
    <div className="main-content flex rounded-lg bg-muted p-4">
      <div
        className={cn('rounded-lg bg-background transition-transform duration-100 ease-in-out', {
          'mr-4 w-96 delay-0': isBlocksLibraryActive,
          'w-0 delay-100': !isBlocksLibraryActive
        })}
      >
        <div
          className={cn('rounded-lg bg-background transition-transform duration-100 ease-in-out', {
            'opacity-100 delay-100': isBlocksLibraryActive,
            'opacity-0 delay-0': !isBlocksLibraryActive
          })}
        >
          <div className="p-4 text-2xl font-bold">Blocks Library</div>
          <div className="flex flex-col gap-2 p-4">
            <BlockCard name="Add" desc="Add a bunch of stuff together" onClick={handleAddAdd} />
            <BlockCard name="Slider" desc="it slides" onClick={handleAddSlider} />
            <BlockCard name="Big Number" desc="Big number" onClick={handleAddBigNumber} />
          </div>
        </div>
      </div>
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
    </div>
  );
};

export default Flow;
