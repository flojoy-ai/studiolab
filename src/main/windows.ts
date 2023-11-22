import { app, shell, BrowserWindow } from 'electron';
import { appRouter } from './api/root';

import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import { createIPCHandler } from 'electron-trpc/main';

let blocksLibraryWindow: BrowserWindow | null = null;

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

  createIPCHandler({ router: appRouter, windows: [blocksLibraryWindow] });

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
    blocksLibraryWindow.loadFile(join(__dirname, '../renderer/index.html' + '#/library'));
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
