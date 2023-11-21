import ReactDOM from 'react-dom/client';
import './styles/index.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Root from './routes/root/Root';
import Index from './routes/index/Index';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import Flow from './routes/flow/Flow';
import Library from './routes/library/Library';
import Home from './routes/home/Home';

const queryClient = new QueryClient();

const router = createHashRouter([
  {
    path: '/',
    element: <Root />, // should contain all the providers
    children: [
      {
        path: '/',
        element: <Home />, // this is a layout that has the header and status bar footer
        children: [
          {
            path: '/setup',
            element: <Index />
          },
          {
            path: '/flow',
            element: <Flow />
          }
        ]
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
