import { create } from 'zustand';

interface FlowchartState {
  running: boolean;
  setRunning: (running: boolean) => void;
}

export const useFlowchartStore = create<FlowchartState>((set) => ({
  running: false,
  setRunning: (running: boolean) => set(() => ({ running }))
}));
