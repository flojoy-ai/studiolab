import log from 'electron-log/main';
import { execCommand } from './executor';
import { app } from 'electron';
import { Command } from './command';
import { ChildProcess, exec } from 'child_process';
import { sendToStatusBar } from './logging';

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
      linux: 'python3.11 -m pip install --user pipx --break-system-packages'
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

export function spawnCaptain(): void {
  const command = new Command({
    darwin: 'poetry run python3 main.py',
    win32: 'poetry run python3 main.py',
    linux: 'poetry run python3 main.py'
  });

  log.info('execCommand: ' + command.getCommand());

  global.captainProcess = exec(command.getCommand(), {
    cwd: app.isPackaged ? process.resourcesPath : undefined
  });

  global.captainProcess.stdout?.on('data', (data) => {
    log.info(data);
    sendToStatusBar(data);
  });

  global.captainProcess.stderr?.on('data', (data) => {
    log.error(data);
    sendToStatusBar(data);
  });

  global.captainProcess.on('error', (error) => {
    log.error(error.message);
    sendToStatusBar(error.message);
  });

  global.captainProcess.on('close', (code) => {
    if (code === 0) {
      const msg = 'captain process exited with code 0';
      log.info(msg);
      sendToStatusBar(msg);
    }
    const msg = 'captain process exited with code 1';
    log.error(msg);
    sendToStatusBar(msg);
  });
}

export function killCaptain(): void {
  (global.captainProcess as ChildProcess).kill('SIGKILL');
}
