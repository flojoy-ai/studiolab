import { create } from 'zustand';

interface FlowchartState {
  running: boolean;
  runFlow: () => void;
  cancelRun: () => void;
}

export const useFlowchartStore = create<FlowchartState>((set) => ({
  running: false,
  runFlow: () => set(() => ({ running: true })),
  cancelRun: () => set(() => ({ running: false }))
}));
