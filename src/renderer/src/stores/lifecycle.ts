import { create } from 'zustand';
import { shared } from 'use-broadcast-ts';

export interface LifecycleState {
  captainReady: boolean;
  setCaptainReady: (state: boolean) => void;

  running: boolean;
  setRunning: (running: boolean) => void;
}

export const useLifecycleStore = create<LifecycleState>(
  shared((set) => ({
    captainReady: false,
    setCaptainReady: (state: boolean): void => set({ captainReady: state }),

    running: false,
    setRunning: (running: boolean) => set(() => ({ running }))
  }))
);
