import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UIState {
  isBlocksLibraryActive: boolean;
  setIsBlocksLibraryActive: (state: boolean) => void;
}

export const useUIStateStore = create<UIState>()(
  persist(
    (set) => ({
      isBlocksLibraryActive: false,
      setIsBlocksLibraryActive: (state: boolean): void => set({ isBlocksLibraryActive: state })
    }),
    {
      name: 'ui-state',
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
