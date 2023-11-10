import { RootRoute, RouterContext } from '@tanstack/react-router';
import { Root } from './Root';

const routerContext = new RouterContext();

export const rootRoute: RootRoute = routerContext.createRootRoute({
  component: Root
});
