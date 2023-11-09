import Header from '@/components/root/Header';
import StatusBar from '@/components/root/StatusBar';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet } from 'react-router-dom';

export const Root = (): JSX.Element => {
  return (
    <ThemeProvider>
      <div className="flex h-screen flex-col bg-muted">
        <Header />
        <Outlet />
        <StatusBar />
        <ReactQueryDevtools buttonPosition="top-right" />
      </div>
    </ThemeProvider>
  );
};

export const tanner = 'hello';
