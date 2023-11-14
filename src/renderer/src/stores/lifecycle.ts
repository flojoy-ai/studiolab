import { create } from 'zustand';

export interface LifecycleState {
  captainReady: boolean;
  setCaptainReady: (state: boolean) => void;

  running: boolean;
  setRunning: (running: boolean) => void;
}
export const useLifecycleStore = create<LifecycleState>((set) => ({
  captainReady: false,
  setCaptainReady: (state: boolean): void => set({ captainReady: state }),

  running: false,
  setRunning: (running: boolean) => set(() => ({ running }))
}));
