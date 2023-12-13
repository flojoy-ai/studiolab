import FlowControlsTopLeft from '@/components/flow/FlowControlsTopLeft';
import FlowControlsTopRight from '@/components/flow/FlowControlsTopRight';
import SmartBezierEdge from '@tisoap/react-flow-smart-edge';
import ReactFlow, {
  Background,
  NodeDragHandler,
  SelectionDragHandler,
  OnNodesDelete,
  OnEdgesDelete,
  ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowchartStore } from '@/stores/flowchart';
import { useShallow } from 'zustand/react/shallow';
import { DragEventHandler, useCallback, useRef, useState } from 'react';
import useUndoRedo from '@/hooks/useUndoRedo';

import { nodeTypes } from '@/configs/flowchart';
import CanvasControlsBottomLeft from '../reactflow/CanvasControlsBottomLeft';
import FlowControlsBottomRight from './FlowControlsBottomRight';
import { useContextMenu } from '@/hooks/useContextMenu';
import { ContextMenu } from './ContextMenu';
import { BlockAddPayload } from '@/types/block';

const edgeTypes = {
  smart: SmartBezierEdge
};

const FlowCanvas = () => {
  const [reactFlowInstance, setReactFlowInstance] = useState<undefined | ReactFlowInstance>(
    undefined
  );
  const reactFlowRef = useRef<HTMLDivElement | null>(null);
  const { menu, onPaneClick, onNodeContextMenu } = useContextMenu(reactFlowRef);

  const { takeSnapshot } = useUndoRedo();
  const { edges, onEdgesChange, nodes, onNodesChange, onConnect, addNode, functionDefinitions } =
    useFlowchartStore(
      useShallow((state) => ({
        edges: state.edges,
        onEdgesChange: state.onEdgesChange,
        nodes: state.nodes,
        onNodesChange: state.onNodesChange,
        onConnect: state.onConnect,
        addNode: state.addNode,
        functionDefinitions: state.functionDefinitions
      }))
    );

  console.log(functionDefinitions);

  const onNodeDragStart: NodeDragHandler = useCallback(() => {
    // 👇 make dragging a node undoable
    takeSnapshot();
    // 👉 you can place your event handlers here
  }, [takeSnapshot]);

  const onSelectionDragStart: SelectionDragHandler = useCallback(() => {
    // 👇 make dragging a selection undoable
    takeSnapshot();
  }, [takeSnapshot]);

  const onNodesDelete: OnNodesDelete = useCallback(() => {
    // 👇 make deleting nodes undoable
    takeSnapshot();
  }, [takeSnapshot]);

  const onEdgesDelete: OnEdgesDelete = useCallback(() => {
    // 👇 make deleting edges undoable
    takeSnapshot();
  }, [takeSnapshot]);

  const onDragOver: DragEventHandler<HTMLDivElement> = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop: DragEventHandler<HTMLDivElement> = useCallback(
    (event) => {
      event.preventDefault();

      if (reactFlowInstance === undefined) {
        // this should never happen
        alert('onDrop: React Flow instance is not available!');
        return;
      }

      const data = event.dataTransfer.getData('application/reactflow');

      // check if the dropped element is valid
      if (data === '') {
        return;
      }

      const payload = JSON.parse(data) as BlockAddPayload;

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      addNode(payload, position);
    },
    [reactFlowInstance]
  );

  return (
    <ReactFlow
      ref={reactFlowRef}
      nodes={nodes}
      nodeTypes={nodeTypes}
      edges={edges}
      edgeTypes={edgeTypes}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onNodeDragStart={onNodeDragStart}
      onSelectionDragStart={onSelectionDragStart}
      onNodesDelete={onNodesDelete}
      onEdgesDelete={onEdgesDelete}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onInit={setReactFlowInstance}
      onPaneClick={onPaneClick}
      onNodeContextMenu={onNodeContextMenu}
      proOptions={{ hideAttribution: true }}
      className="rounded-lg bg-background"
    >
      <FlowControlsTopLeft />
      <FlowControlsTopRight />
      <FlowControlsBottomRight />
      <CanvasControlsBottomLeft />
      <Background />
      {menu && <ContextMenu onClick={onPaneClick} {...menu} />}
    </ReactFlow>
  );
};

export default FlowCanvas;
