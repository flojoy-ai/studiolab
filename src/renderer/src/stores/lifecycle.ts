import { create } from 'zustand';
import { shared } from 'use-broadcast-ts';

export interface LifecycleState {
  captainReady: boolean;
  setCaptainReady: (state: boolean) => void;

  flowRunning: boolean;
  setFlowRunning: (running: boolean) => void;

  flowReady: boolean;
  setFlowReady: (running: boolean) => void;
}

export const useLifecycleStore = create<LifecycleState>(
  shared((set) => ({
    captainReady: false as boolean,
    setCaptainReady: (state: boolean): void => set({ captainReady: state }),

    flowRunning: false as boolean,
    setFlowRunning: (running: boolean) => {
      set(() => ({ flowRunning: running }));
      if (!running) set(() => ({ flowReady: false }));
    },

    flowReady: false as boolean,
    setFlowReady: (running: boolean) => set(() => ({ flowReady: running }))
  }))
);
