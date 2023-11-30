import { openLogFolder } from '../../logging';
import { app, nativeTheme } from 'electron';
import { spawnBlocksLibraryWindow, spawnControlWindow, spawnFlowWindow } from '../../windows';
import { t } from '../trpc';
import { z } from 'zod';

export const baseRouter = t.router({
  openLogFolder: t.procedure.mutation(() => {
    openLogFolder();
  }),
  restartFlojoyStudio: t.procedure.mutation(() => {
    app.relaunch();
    app.exit();
  }),
  spawnBlockLibraryWindow: t.procedure.mutation(async () => {
    await spawnBlocksLibraryWindow();
  }),
  spawnFlowWindow: t.procedure.mutation(async () => {
    await spawnFlowWindow();
  }),
  spawnControlWindow: t.procedure.mutation(async () => {
    await spawnControlWindow();
  }),
  setTheme: t.procedure.input(z.enum(['light', 'dark', 'system'])).mutation((opts) => {
    nativeTheme.themeSource = opts.input;
  })
});
