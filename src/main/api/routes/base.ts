import { openLogFolder } from '../../logging';
import { app } from 'electron';
import { spawnBlocksLibraryWindow } from '../../windows';
import { t } from '../trpc';

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
  })
});
