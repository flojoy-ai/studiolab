import StatusBar from '@/components/root/StatusBar';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Root = (): JSX.Element => {
  return (
    <div className="flex h-screen flex-col bg-muted">
      <Outlet />
      <StatusBar />
      <TanStackRouterDevtools position="top-right" />
      <ReactQueryDevtools buttonPosition="top-right" />
    </div>
  );
};

export const tanner = 'hello';
