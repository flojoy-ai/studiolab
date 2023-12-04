import ReactDOM from 'react-dom/client';
import './styles/index.css';
import './styles/reactflow.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Root from './routes/root/Root';
import Setup from './routes/setup/Setup';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Flow from './routes/flow/Flow';
import Library from './routes/library/Library';
import { ipcLink } from 'electron-trpc/renderer';
import { createTRPCProxyClient } from '@trpc/client';
import type { AppRouter } from 'src/main/api/root.d';
import Control from './routes/control/Control';

const queryClient = new QueryClient();

export const trpcClient = createTRPCProxyClient<AppRouter>({
  links: [ipcLink()]
});

const router = createHashRouter([
  {
    path: '/',
    element: <Root />, // should contain all the providers
    children: [
      {
        path: '/flow',
        element: <Flow />
      },
      {
        path: '/setup',
        element: <Setup />
      },
      {
        path: '/control',
        element: <Control />
      },
      {
        path: '/library',
        element: <Library />
      }
    ]
  }
]);

const rootElement = document.getElementById('root')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
