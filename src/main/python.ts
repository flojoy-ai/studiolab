import { PythonShell } from 'python-shell';
import log from 'electron-log/main';
import { execCommand } from './executor';
import { app } from 'electron';

export function checkPythonInstallation(): Promise<string> {
  return execCommand('conda --version');
}

export function installPipx(): Promise<string> {
  return execCommand('python3.11 -m pip install --user pipx');
}

export function installPoetry(): Promise<string> {
  return execCommand('pipx install poetry');
}

export function installDependencies(): Promise<string> {
  return execCommand('poetry install');
}

export function getPoetryVenvExecutable(): Promise<string> {
  return execCommand('poetry env info --executable');
}

export function spawnCaptain(pythonPath: string): void {
  try {
    global.captainProcess = new PythonShell('main.py', {
      pythonPath: pythonPath.trim(),
      cwd: app.isPackaged ? process.resourcesPath : undefined,
      mode: 'text'
    });
    global.captainProcess.on('message', (message: string) => {
      log.info(message);
    });
  } catch (error) {
    log.info(error);
  }
}

export function killCaptain(): void {
  (global.captainProcess as PythonShell).kill();
}
