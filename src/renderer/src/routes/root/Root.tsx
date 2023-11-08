import StatusBar from '@/components/root/StatusBar';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet } from 'react-router-dom';

export const Root = (): JSX.Element => {
  return (
    <div className="flex h-screen flex-col bg-muted">
      <Outlet />
      <StatusBar />
      <ReactQueryDevtools buttonPosition="top-right" />
    </div>
  );
};

export const tanner = 'hello';
