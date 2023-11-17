import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition
} from 'reactflow';
import { BlockType } from '@/types/block';

import { v4 as uuidv4 } from 'uuid';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useUndoRedoStore } from './undoredo';

interface FlowchartState {
  nodes: Node[];
  edges: Edge[];
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;

  addNode: (block_type: BlockType, position: XYPosition) => void;
  reset: () => void;
}

export const useFlowchartStore = create<FlowchartState>()(
  persist(
    (set, get) => ({
      nodes: [] as Node[],
      edges: [] as Edge[],
      setNodes: (nodes: Node[]) => set({ nodes }),
      setEdges: (edges: Edge[]) => set({ edges }),

      onNodesChange: (changes: NodeChange[]) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes)
        });
      },
      onEdgesChange: (changes: EdgeChange[]) => {
        set({
          edges: applyEdgeChanges(changes, get().edges)
        });
      },
      onConnect: (connection: Connection) => {
        const undoredoStore = useUndoRedoStore.getState();
        undoredoStore.takeSnapshot();
        set({
          edges: addEdge(connection, get().edges)
        });
      },
      addNode: (block_type: BlockType, position: XYPosition) => {
        const undoredoStore = useUndoRedoStore.getState();
        undoredoStore.takeSnapshot();
        set({
          nodes: get().nodes.concat([
            {
              id: `${block_type}-${uuidv4()}`,
              type: block_type,
              position: position,
              data: {
                label: block_type,
                block_type
              }
            }
          ])
        });
      },
      reset: () => {
        set({
          nodes: [],
          edges: []
        });
      }
    }),
    {
      name: 'flow-state',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
