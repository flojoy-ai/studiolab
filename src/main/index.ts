import { app, shell, BrowserWindow, ipcMain } from 'electron';
import installExtension, { REACT_DEVELOPER_TOOLS } from 'electron-devtools-installer';

import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { createIPCHandler } from 'electron-trpc/main';
import log from 'electron-log/main';
import fixPath from 'fix-path';
import { appRouter } from './api/root';
import { killProcess } from './python';

fixPath();

// Optional, initialize the logger for any renderer process
log.initialize({ preload: true });

log.info('Welcome to Flojoy Studio!');

async function createWindow(): Promise<void> {
  await killProcess(2333);

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    trafficLightPosition: {
      x: 15,
      y: 15 // macOS traffic lights seem to be 14px in diameter. If you want them vertically centered, set this to `titlebar_height / 2 - 7`.
    },
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  createIPCHandler({ router: appRouter, windows: [mainWindow] });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/setup');
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'setup' });
  }

  app.on('before-quit', () => {
    mainWindow.removeAllListeners('close');
  });

  const logListener = (event): void => {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send('status-bar-logging', event);
    } else {
      log.error("Can't send message to statusBar: mainWindow is destroyed");
    }
  };

  ipcMain.on('status-bar-logging', logListener);
  app.on('window-all-closed', () => {
    ipcMain.removeListener('status-bar-logging', logListener);
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  // Set app user model id for windows

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

  await createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
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
