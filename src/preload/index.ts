import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

// Custom APIs for renderer
export const api = {
  getCondaEnvList: (): Promise<string> => ipcRenderer.invoke('get-conda-env-list'),
  createFlojoyStudioEnv: (): Promise<string> => ipcRenderer.invoke('create-flojoy-studio-env'),
  checkCondaInstallation: (): Promise<void> => ipcRenderer.invoke('check-conda-installation'),
  killCaptain: (): Promise<string> => ipcRenderer.invoke('kill-captain'),
  spawnCaptain: (pythonPath: string, entryPath: string): Promise<void> =>
    ipcRenderer.invoke('spawn-captain', pythonPath, entryPath),
  installDependencies: (): Promise<string> => ipcRenderer.invoke('install-dependencies'),
  installPoetry: (): Promise<string> => ipcRenderer.invoke('install-poetry'),
  upgradePip: (): Promise<string> => ipcRenderer.invoke('upgrade-pip')
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
