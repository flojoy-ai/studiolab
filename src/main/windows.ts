import { app, shell, BrowserWindow, ipcMain } from 'electron';

import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import log from 'electron-log/main';

// TODO: DRY this up

let blocksLibraryWindow: BrowserWindow | null = null;
let controlWindow: BrowserWindow | null = null;
let flowWindow: BrowserWindow | null = null;

export async function spawnFlowWindow(): Promise<void> {
  if (flowWindow) {
    if (flowWindow.isMinimized()) flowWindow.restore();
    flowWindow.focus();
    return;
  }
  // Create the browser window.
  flowWindow = new BrowserWindow({
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

  flowWindow.on('ready-to-show', () => {
    if (flowWindow) {
      flowWindow.show();
    }
  });

  flowWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    flowWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/setup');
  } else {
    flowWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'setup' });
  }

  app.on('before-quit', () => {
    if (flowWindow) {
      flowWindow.removeAllListeners('close');
    }
  });

  const logListener = (event): void => {
    if (flowWindow && !flowWindow.isDestroyed()) {
      flowWindow.webContents.send('status-bar-logging', event);
    } else {
      log.error("Can't send message to statusBar: mainWindow is destroyed");
    }
  };

  ipcMain.on('status-bar-logging', logListener);
  app.on('window-all-closed', () => {
    ipcMain.removeListener('status-bar-logging', logListener);
  });

  flowWindow.on('closed', () => {
    flowWindow = null;
  });
}

export async function spawnBlocksLibraryWindow(): Promise<void> {
  if (blocksLibraryWindow) {
    if (blocksLibraryWindow.isMinimized()) blocksLibraryWindow.restore();
    blocksLibraryWindow.focus();
    return;
  }

  // Create the browser window.
  blocksLibraryWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    alwaysOnTop: true,
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

  blocksLibraryWindow.on('ready-to-show', () => {
    if (blocksLibraryWindow) {
      blocksLibraryWindow.show();

      // Tricky way to bring cam bubble to top over fullscreen windows on mac
      blocksLibraryWindow.setAlwaysOnTop(true, 'floating', 1);
      blocksLibraryWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
      blocksLibraryWindow.setFullScreenable(false);

      // Below statement completes the flow
      blocksLibraryWindow.moveTop();
    }
  });

  blocksLibraryWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    blocksLibraryWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/library');
  } else {
    blocksLibraryWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'library' });
  }

  app.on('before-quit', () => {
    if (blocksLibraryWindow) {
      blocksLibraryWindow.removeAllListeners('close');
    }
  });

  blocksLibraryWindow.on('closed', () => {
    blocksLibraryWindow = null;
  });
}

export async function spawnControlWindow(): Promise<void> {
  if (controlWindow) {
    if (controlWindow.isMinimized()) controlWindow.restore();
    controlWindow.focus();
    return;
  }

  // Create the browser window.
  controlWindow = new BrowserWindow({
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

  controlWindow.on('ready-to-show', () => {
    if (controlWindow) {
      controlWindow.show();
    }
  });

  controlWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    controlWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#/control');
  } else {
    controlWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'control' });
  }

  const logListener = (event): void => {
    if (controlWindow) {
      if (!controlWindow.isDestroyed()) {
        controlWindow.webContents.send('status-bar-logging', event);
      } else {
        log.error("Can't send message to statusBar: mainWindow is destroyed");
      }
    }
  };

  ipcMain.on('status-bar-logging', logListener);

  const flowchartListener = (event): void => {
    if (controlWindow) {
      if (!controlWindow.isDestroyed()) {
        controlWindow.webContents.send('flowchart-response', event);
      } else {
        log.error("Can't send message to statusBar: mainWindow is destroyed");
      }
    }
  };

  ipcMain.on('flowchart-response', flowchartListener);

  app.on('window-all-closed', () => {
    ipcMain.removeListener('status-bar-logging', logListener);
    ipcMain.removeListener('flowchart-response', flowchartListener);
  });

  app.on('before-quit', () => {
    if (controlWindow) {
      controlWindow.removeAllListeners('close');
    }
  });

  controlWindow.on('closed', () => {
    controlWindow = null;
  });
}
