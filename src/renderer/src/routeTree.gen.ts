import { route as rootRoute } from "./routes/__root"

declare module "@tanstack/react-router" {
  interface FileRoutesByPath {}
}

export const routeTree = rootRoute.addChildren([])
