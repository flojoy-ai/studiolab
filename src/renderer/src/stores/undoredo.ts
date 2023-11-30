import { create } from 'zustand';
import { Node, Edge } from 'reactflow';
import { useFlowchartStore } from './flowchart';
import { createJSONStorage, persist } from 'zustand/middleware';
import { shared } from 'use-broadcast-ts';

type HistoryItem = {
  nodes: Node[];
  edges: Edge[];
};

interface UndoRedoState {
  maxHistorySize: number;

  past: HistoryItem[];
  future: HistoryItem[];
  setPast: (past: HistoryItem[]) => void;
  setFuture: (future: HistoryItem[]) => void;

  takeSnapshot: () => void;
}

export const useUndoRedoStore = create<UndoRedoState>()(
  shared(
    persist(
      (set, get) => ({
        maxHistorySize: 100,

        past: [] as HistoryItem[],
        future: [] as HistoryItem[],
        setPast: (past: HistoryItem[]) => set({ past }),
        setFuture: (future: HistoryItem[]) => set({ future }),

        takeSnapshot: () => {
          const flowchartStore = useFlowchartStore.getState();
          set({
            past: [
              ...get().past.slice(get().past.length - get().maxHistorySize + 1, get().past.length),
              { nodes: flowchartStore.nodes, edges: flowchartStore.edges }
            ],
            future: []
          });
        }
      }),
      {
        name: 'flow-state',
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
);
