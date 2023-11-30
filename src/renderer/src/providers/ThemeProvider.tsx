import { createContext, useContext, useEffect } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { shared } from 'use-broadcast-ts';
import { trpcClient } from '@/main';

type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
};

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const initialState: ThemeState = {
  theme: 'system',
  setTheme: () => null
};

const ThemeProviderContext = createContext<ThemeState>(initialState);

const useThemeStore = create<ThemeState>()(
  // Joey: this is needed to broadcase the theme state across all windows
  shared(
    persist(
      (set) => ({
        theme: 'system' as Theme,
        setTheme: (theme: Theme) => {
          set({ theme });
          trpcClient.setTheme.mutate(theme);
        }
      }),
      {
        name: 'theme-state',
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
);

export function ThemeProvider({ children, ...props }: ThemeProviderProps): JSX.Element {
  const { theme, setTheme } = useThemeStore(
    useShallow((state) => ({ theme: state.theme, setTheme: state.setTheme }))
  );

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = (): ThemeState => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) throw new Error('useTheme must be used within a ThemeProvider');

  return context;
};
