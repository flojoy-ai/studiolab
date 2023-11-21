import { app, shell, BrowserWindow } from 'electron';

import { join } from 'path';
import { is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';

export async function spawnBlocksLibraryWindow(): Promise<void> {
  // Create the browser window.
  const blocksLibraryWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    alwaysOnTop: true,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

  blocksLibraryWindow.on('ready-to-show', () => {
    blocksLibraryWindow.show();

    // Tricky way to bring cam bubble to top over fullscreen windows on mac
    blocksLibraryWindow.setAlwaysOnTop(true, 'floating', 1);
    blocksLibraryWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
    blocksLibraryWindow.setFullScreenable(false);

    // Below statement completes the flow
    blocksLibraryWindow.moveTop();
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
    blocksLibraryWindow.removeAllListeners('close');
  });
}
