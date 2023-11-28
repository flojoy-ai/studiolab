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

  addNode: (block_type: BlockType, position: XYPosition, parent?: string) => void;
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
        set((state) => {
          const parent = state.nodes.find((n) => {
            if (!n.width || !n.height) return false;

            return (
              n.type === 'function' &&
              n.position.x < position.x &&
              n.position.x + n.width > position.x &&
              n.position.y < position.y &&
              n.position.y + n.height > position.y
            );
          });

          // The position of parents within subflows is measured relative to the parent
          // so we need to convert from absolute position to relative position for child nodes
          const adjustedPosition = !parent
            ? position
            : {
                x: position.x - parent.position.x,
                y: position.y - parent.position.y
              };

          return {
            nodes: state.nodes.concat([
              {
                id: `${block_type}-${uuidv4()}`,
                type: block_type,
                position: adjustedPosition,
                data: {
                  label: block_type,
                  block_type
                },
                parentNode: parent?.id,
                extent: parent ? 'parent' : undefined
              }
            ])
          };
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
