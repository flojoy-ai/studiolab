import { app, BrowserWindow } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

import { electronApp, optimizer } from '@electron-toolkit/utils';
import { createIPCHandler } from 'electron-trpc/main';
import log from 'electron-log/main';
import fixPath from 'fix-path';
import { appRouter } from './api/root';
import { killProcess } from './python';
import { spawnFlowWindow } from './windows';

fixPath();

// Optional, initialize the logger for any renderer process
log.initialize({ preload: true });

log.info('Welcome to Flojoy Studio!');

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows
  await killProcess(2333);

  if (!app.isPackaged) {
    installExtension(REACT_DEVELOPER_TOOLS);
  }
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createIPCHandler({ router: appRouter });

  await spawnFlowWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) spawnFlowWindow();
  });
});

app.on('quit', (e) => {
  e.preventDefault();
  app.quit();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', async () => {
  try {
    await killProcess(2333);
    log.info('Successfully terminated captain :)');
  } catch (error) {
    log.error('Something went wrong when terminating captain!');
    log.error(error);
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
