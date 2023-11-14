import AddBlock from '@/components/blocks/AddBlock';
import BigNumberBlock from '@/components/blocks/BigNumberBlock';
import SliderBlock from '@/components/blocks/SliderBlock';
import FlowControlsTopLeft from '@/components/flow/FlowControlsTopLeft';
import FlowControlsTopRight from '@/components/flow/FlowControlsTopRight';
import SmartBezierEdge from '@tisoap/react-flow-smart-edge';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowchartStore } from '@/stores/flowchart';
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
  const { edges, onEdgesChange, nodes, onNodesChange, onConnect } = useFlowchartStore(
    useShallow((state) => ({
      setRunning: state.setRunning,
      edges: state.edges,
      onEdgesChange: state.onEdgesChange,
      nodes: state.nodes,
      onNodesChange: state.onNodesChange,
      onConnect: state.onConnect
    }))
  );

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
      <FlowControlsTopLeft />
      <FlowControlsTopRight />
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
};

export default FlowCanvas;
