import { openLogFolder } from '../logging';
import { app } from 'electron';
import { pythonRouter } from './python';

import { spawnBlocksLibraryWindow } from '../windows';

import { initTRPC } from '@trpc/server';

export const t = initTRPC.create({ isServer: true });

const baseRouter = t.router({
  openLogFolder: t.procedure.query(() => {
    openLogFolder();
  }),
  restartFlojoyStudio: t.procedure.query(() => {
    app.relaunch();
    app.exit();
  }),
  spawnBlockLibraryWindow: t.procedure.query(async () => {
    await spawnBlocksLibraryWindow();
  })
});

export const appRouter = t.mergeRouters(baseRouter, pythonRouter);
