import { create } from 'zustand';

export interface UIState {
  isBlocksLibraryActive: boolean;
  setIsBlocksLibraryActive: (state: boolean) => void;
}

export const useUIStateStore = create<UIState>((set) => ({
  isBlocksLibraryActive: false,
  setIsBlocksLibraryActive: (state: boolean): void => set({ isBlocksLibraryActive: state })
}));
