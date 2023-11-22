import { appRouter } from './root';

// Expose only type file to renderer process
export type AppRouter = typeof appRouter;
