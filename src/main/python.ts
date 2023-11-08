import { PythonShell } from 'python-shell';
import log from 'electron-log/main';
import { execCommand } from './executor';
import { app } from 'electron';
import { Command } from './command';

export function checkPythonInstallation(): Promise<string> {
  return execCommand(
    new Command({
      darwin: 'python3.11 --version',
      win32: 'python3.11 --version',
      linux: 'python3.11 --version'
    })
  );
}

export function installPipx(): Promise<string> {
  return execCommand(
    new Command({
      darwin: 'python3.11 -m pip install --user pipx',
      win32: 'python3.11 -m pip install --user pipx',
      linux: 'python3.11 -m pip install --user pipx'
    })
  );
}

export function installPoetry(): Promise<string> {
  return execCommand(
    new Command({
      darwin: 'python3.11 -m pipx install poetry',
      win32: 'python3.11 -m pipx install poetry',
      linux: 'python3.11 -m pipx install poetry'
    })
  );
}

export function installDependencies(): Promise<string> {
  return execCommand(
    new Command({
      darwin: 'poetry install',
      win32: 'poetry install',
      linux: 'poetry install'
    })
  );
}

export function getPoetryVenvExecutable(): Promise<string> {
  return execCommand(
    new Command({
      darwin: 'poetry env info --executable',
      win32: 'poetry env info --executable',
      linux: 'poetry env info --executable'
    })
  );
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
    log.error(error);
  }
}

export function killCaptain(): void {
  (global.captainProcess as PythonShell).kill();
}
