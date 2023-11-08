import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import {
  checkPythonInstallation,
  installDependencies,
  installPoetry,
  installPipx,
  getPoetryVenvExecutable,
  killCaptain,
  spawnCaptain
} from './python';
import { PythonShell } from 'python-shell';
import log from 'electron-log/main';
import fixPath from 'fix-path';

fixPath();

// Optional, initialize the logger for any renderer process
log.initialize({ preload: true });

log.info('Log from the main process');

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  });

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
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });

  ipcMain.handle('check-python-installation', checkPythonInstallation);
  ipcMain.handle('install-pipx', installPipx);
  ipcMain.handle('install-poetry', installPoetry);
  ipcMain.handle('install-dependencies', installDependencies);
  ipcMain.handle('get-poetry-venv-executable', getPoetryVenvExecutable);
  ipcMain.handle('spawn-captain', (_, arg) => spawnCaptain(arg));
  ipcMain.handle('kill-captain', killCaptain);
});

app.on('quit', () => {
  const captainProcess = global['captainProcess'] as PythonShell;
  if (captainProcess) {
    killCaptain();
    if (captainProcess.terminated) {
      console.log('Successfully terminated captain :)');
    } else {
      console.error('Something went wrong when terminating captain!');
    }
  }
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
