import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
export const api = {
  checkPythonInstallation: (): Promise<string> => ipcRenderer.invoke('check-python-installation'),
  checkPipxInstallation: (): Promise<string> => ipcRenderer.invoke('check-pipx-installation'),
  installPipx: (): Promise<string> => ipcRenderer.invoke('install-pipx'),
  pipxEnsurepath: (): Promise<void> => ipcRenderer.invoke('pipx-ensurepath'),
  installPoetry: (): Promise<string> => ipcRenderer.invoke('install-poetry'),
  installDependencies: (): Promise<string> => ipcRenderer.invoke('install-dependencies'),
  getPoetryVenvExecutable: (): Promise<string> => ipcRenderer.invoke('get-poetry-venv-executable'),
  spawnCaptain: (): Promise<void> => ipcRenderer.invoke('spawn-captain'),
  killCaptain: (): Promise<string> => ipcRenderer.invoke('kill-captain'),

  openLogFolder: (): Promise<void> => ipcRenderer.invoke('open-log-folder'),
  restartFlojoyStudio: (): Promise<void> => ipcRenderer.invoke('restart-flojoy-studio')
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
