import ReactFlow, {
  Background
  // NodeDragHandler,
  // SelectionDragHandler,
  // OnNodesDelete,
  // ReactFlowInstance
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useFlowchartStore } from '@/stores/flowchart';
import { useShallow } from 'zustand/react/shallow';
import { nodeTypes } from '@/configs/control';
// import { useCallback, useState } from 'react';
// import useUndoRedo from '@/hooks/useUndoRedo';

const ControlCanvas = () => {
  // const [reactFlowInstance, setReactFlowInstance] = useState<undefined | ReactFlowInstance>(
  //   undefined
  // );

  // const { takeSnapshot } = useUndoRedo();

  const { controls, onControlsChange } = useFlowchartStore(
    useShallow((state) => ({
      controls: state.controls,
      onControlsChange: state.onControlsChange
    }))
  );

  // const onNodeDragStart: NodeDragHandler = useCallback(() => {
  //   // 👇 make dragging a node undoable
  //   takeSnapshot();
  //   // 👉 you can place your event handlers here
  // }, [takeSnapshot]);
  //
  // const onSelectionDragStart: SelectionDragHandler = useCallback(() => {
  //   // 👇 make dragging a selection undoable
  //   takeSnapshot();
  // }, [takeSnapshot]);
  //
  // const onNodesDelete: OnNodesDelete = useCallback(() => {
  //   // 👇 make deleting nodes undoable
  //   takeSnapshot();
  // }, [takeSnapshot]);

  return (
    <ReactFlow
      nodes={controls}
      nodeTypes={nodeTypes}
      onNodesChange={onControlsChange}
      // onConnect={onConnect}
      // onNodeDragStart={onNodeDragStart}
      // onSelectionDragStart={onSelectionDragStart}
      // onNodesDelete={onNodesDelete}
      // onInit={setReactFlowInstance}
      proOptions={{ hideAttribution: true }}
      className="rounded-lg bg-background"
    >
      <Background />
    </ReactFlow>
  );
};

export default ControlCanvas;
