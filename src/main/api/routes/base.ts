import { openLogFolder } from '../../logging';
import { app, nativeTheme } from 'electron';
import {
  closeSetupWindow,
  spawnBlocksLibraryWindow,
  spawnControlWindow,
  spawnFlowWindow
} from '../../windows';
import { t } from '../trpc';
import { z } from 'zod';
import { autoUpdater } from 'electron-updater';

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
  closeSetupWindow: t.procedure.mutation(async () => {
    await closeSetupWindow();
  }),
  setTheme: t.procedure.input(z.enum(['light', 'dark', 'system'])).mutation((opts) => {
    nativeTheme.themeSource = opts.input;
  }),
  checkForUpdatesAndNotify: t.procedure.mutation(async () => {
    await autoUpdater.checkForUpdatesAndNotify();
  })
});
