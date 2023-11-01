import ReactDOM from 'react-dom/client'
import './styles/index.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, Router } from '@tanstack/react-router'
import { rootRoute } from './routes/root/rootRoute'
import { indexRoute } from './routes/index/indexRoute'

const queryClient = new QueryClient()

const routeTree = rootRoute.addChildren([indexRoute])

// Set up a Router instance
const router = new Router({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent'
})

// Register things for typesafety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('root')!

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
