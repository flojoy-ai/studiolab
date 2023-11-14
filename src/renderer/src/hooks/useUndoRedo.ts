import { useFlowchartStore } from '@/stores/flowchart';
import { useUndoRedoStore } from '@/stores/undoredo';
import { useCallback, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

type UseUndoRedoOptions = {
  enableShortcuts: boolean;
};

type UseUndoRedo = (options?: UseUndoRedoOptions) => {
  undo: () => void;
  redo: () => void;
  takeSnapshot: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

const defaultOptions: UseUndoRedoOptions = {
  enableShortcuts: true
};

// https://redux.js.org/usage/implementing-undo-history
export const useUndoRedo: UseUndoRedo = ({
  enableShortcuts = defaultOptions.enableShortcuts
} = defaultOptions) => {
  // the past and future arrays store the states that we can jump to

  const { past, setPast, future, setFuture, takeSnapshot } = useUndoRedoStore(
    useShallow((state) => ({
      past: state.past,
      setPast: state.setPast,
      future: state.future,
      setFuture: state.setFuture,
      takeSnapshot: state.takeSnapshot
    }))
  );

  const { edges, setEdges, nodes, setNodes } = useFlowchartStore(
    useShallow((state) => ({
      edges: state.edges,
      setEdges: state.setEdges,
      nodes: state.nodes,
      setNodes: state.setNodes
    }))
  );

  const undo = useCallback(() => {
    // get the last state that we want to go back to
    const pastState = past[past.length - 1];

    if (pastState) {
      // first we remove the state from the history
      setPast(past.slice(0, past.length - 1));
      // we store the current graph for the redo operation
      setFuture([...future, { nodes, edges }]);
      // now we can set the graph to the past state
      setNodes(pastState.nodes);
      setEdges(pastState.edges);
    }
  }, [setNodes, setEdges, nodes, edges, past]);

  const redo = useCallback(() => {
    const futureState = future[future.length - 1];

    if (futureState) {
      setFuture(future.slice(0, future.length - 1));
      setPast([...past, { nodes, edges }]);
      setNodes(futureState.nodes);
      setEdges(futureState.edges);
    }
  }, [setNodes, setEdges, nodes, edges, future]);

  useEffect(() => {
    // this effect is used to attach the global event handlers
    if (!enableShortcuts) {
      return;
    }

    const keyDownHandler = (event: KeyboardEvent) => {
      if (event.key === 'z' && (event.ctrlKey || event.metaKey) && event.shiftKey) {
        redo();
      } else if (event.key === 'z' && (event.ctrlKey || event.metaKey)) {
        undo();
      }
    };

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [undo, redo, enableShortcuts]);

  return {
    undo,
    redo,
    takeSnapshot,
    canUndo: !past.length,
    canRedo: !future.length
  };
};

export default useUndoRedo;
