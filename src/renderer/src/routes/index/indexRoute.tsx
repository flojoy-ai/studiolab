import { lazyRouteComponent, Route, RootRoute } from '@tanstack/react-router';
import { rootRoute } from '@/routes/root/rootRoute';

export const indexRoute = new Route({
  getParentRoute: (): RootRoute => rootRoute,
  path: '/',
  component: lazyRouteComponent(() => import('./Index'), 'Index')
});
