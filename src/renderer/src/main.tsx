import ReactDOM from 'react-dom/client';
import './styles/index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Root } from './routes/root/Root';
import { Index } from './routes/index/Index';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Flow from './routes/flow/Flow';

const queryClient = new QueryClient();

const router = createHashRouter([
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/',
        element: <Index />
      },
      {
        path: '/flow',
        element: <Flow />
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
