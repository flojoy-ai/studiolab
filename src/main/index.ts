import { app, shell, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';
import icon from '../../resources/icon.png?asset';
import {
  checkPythonInstallation,
  installDependencies,
  installPoetry,
  installPipx,
  killCaptain,
  spawnCaptain,
  pipxEnsurepath,
  checkPipxInstallation
} from './python';
import log from 'electron-log/main';
import fixPath from 'fix-path';
import { openLogFolder } from './logging';
import { ChildProcess } from 'child_process';

fixPath();

// Optional, initialize the logger for any renderer process
log.initialize({ preload: true });

log.info('Welcome to Flojoy Studio!');

function createWindow(): void {
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

// Joey: Taken from
// https://github.com/electron/electron/issues/24427
const encodeError = (e) => {
  return { name: e.name, message: e.message, extra: { ...e } };
};
const handleWithCustomErrors = (channel, handler) => {
  ipcMain.handle(channel, async (...args) => {
    try {
      return { result: await Promise.resolve(handler(...args)) };
    } catch (e) {
      return { error: encodeError(e) };
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron');

  handleWithCustomErrors('check-python-installation', checkPythonInstallation);
  handleWithCustomErrors('check-pipx-installation', checkPipxInstallation);
  handleWithCustomErrors('install-pipx', installPipx);
  handleWithCustomErrors('pipx-ensurepath', pipxEnsurepath);
  handleWithCustomErrors('install-poetry', installPoetry);
  handleWithCustomErrors('install-dependencies', installDependencies);
  handleWithCustomErrors('spawn-captain', spawnCaptain);
  handleWithCustomErrors('kill-captain', killCaptain);

  handleWithCustomErrors('open-log-folder', openLogFolder);

  handleWithCustomErrors('restart-flojoy-studio', () => {
    app.relaunch();
    app.exit();
  });

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
});

app.on('quit', (e) => {
  e.preventDefault();
  const captainProcess = global.captainProcess as ChildProcess;
  if (captainProcess && captainProcess.exitCode === null) {
    const success = killCaptain();
    if (success) {
      global.captainProcess = null;
      log.info('Successfully terminated captain :)');
    } else {
      log.error('Something went wrong when terminating captain!');
    }
  }
  app.quit();
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
