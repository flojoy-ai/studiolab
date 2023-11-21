import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Joey: Taken from
// https://github.com/electron/electron/issues/24427
const decodeError = ({ name, message, extra }) => {
  const e = new Error(message);
  e.name = name;
  Object.assign(e, extra);
  return e;
};
const invokeWithCustomErrors = async (channel, ...args) => {
  const { error, result } = await ipcRenderer.invoke(channel, args);
  if (error) {
    throw decodeError(error);
  }
  return result;
};

// Custom APIs for renderer
export const api = {
  checkPythonInstallation: () => invokeWithCustomErrors('check-python-installation'),
  checkPipxInstallation: () => invokeWithCustomErrors('check-pipx-installation'),
  installPipx: () => invokeWithCustomErrors('install-pipx'),
  pipxEnsurepath: () => invokeWithCustomErrors('pipx-ensurepath'),
  installPoetry: () => invokeWithCustomErrors('install-poetry'),
  installDependencies: () => invokeWithCustomErrors('install-dependencies'),
  getPoetryVenvExecutable: () => invokeWithCustomErrors('get-poetry-venv-executable'),
  spawnCaptain: () => invokeWithCustomErrors('spawn-captain'),
  killCaptain: () => invokeWithCustomErrors('kill-captain'),

  openLogFolder: () => invokeWithCustomErrors('open-log-folder'),
  restartFlojoyStudio: () => invokeWithCustomErrors('restart-flojoy-studio')
};

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI);
    contextBridge.exposeInMainWorld('api', api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI;
  // @ts-ignore (define in dts)
  window.api = api;
}
