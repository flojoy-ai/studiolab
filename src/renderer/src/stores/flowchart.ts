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
  applyEdgeChanges
} from 'reactflow';
import { BlockType } from '@/types/block';

import { v4 as uuidv4 } from 'uuid';

interface FlowchartState {
  nodes: Node[];
  edges: Edge[];
  addNode: (block_type: BlockType) => () => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  running: boolean;
  setRunning: (running: boolean) => void;
}

export const useFlowchartStore = create<FlowchartState>((set, get) => ({
  running: false,
  setRunning: (running: boolean) => set(() => ({ running })),
  nodes: [],
  edges: [],
  addNode: (block_type: BlockType) => {
    return () =>
      set({
        nodes: get().nodes.concat([
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
      });
  },
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
    set({
      edges: addEdge(connection, get().edges)
    });
  }
}));
