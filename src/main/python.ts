import log from 'electron-log/main';
import http from 'http';
import { execCommand } from './executor';
import { app } from 'electron';
import { Command } from './command';
import { spawn } from 'child_process';
import { sendToStatusBar } from './logging';

export async function checkPythonInstallation(): Promise<string> {
  return execCommand(
    new Command({
      win32: 'python -c "import sys; assert sys.version_info >= (3, 11)" && python --version',
      darwin: 'python3.11 --version',
      linux: 'python3.11 --version'
    })
  );
}

export async function checkPipxInstallation(): Promise<string> {
  return execCommand(
    new Command({
      win32: 'pipx --version',
      darwin: 'pipx --version',
      linux: 'pipx --version'
    })
  );
}

export async function installPipx(): Promise<string> {
  return execCommand(
    new Command({
      win32: 'python -m pip install --user pipx',
      darwin: 'python3.11 -m pip install --user pipx',
      linux: 'python3.11 -m pip install --user pipx --break-system-packages'
    })
  );
}

export async function pipxEnsurepath(): Promise<string> {
  return execCommand(
    new Command({
      win32: 'python -m pipx ensurepath',
      darwin: 'python3.11 -m pipx ensurepath',
      linux: 'python3.11 -m pipx ensurepath'
    })
  );
}

export async function installPoetry(): Promise<string> {
  return execCommand(
    new Command({
      win32: 'python -m pipx install poetry',
      darwin: 'python3.11 -m pipx install poetry',
      linux: 'python3.11 -m pipx install poetry'
    })
  );
}

export async function installDependencies(): Promise<string> {
  return execCommand(
    new Command({
      win32: 'poetry install',
      darwin: 'poetry install',
      linux: 'poetry install'
    })
  );
}

export function spawnCaptain(): void {
  const command = new Command({
    win32: 'poetry run python main.py',
    darwin: 'poetry run python3 main.py',
    linux: 'poetry run python3 main.py'
  });

  log.info('execCommand: ' + command.getCommand());

  if (global.captainProcess) {
    log.error('spawnCaptain failed, the process already exists!');
    return;
  }
  const captainProcess = spawn(
    command.getCommand().split(' ')[0],
    command.getCommand().split(' ').slice(1),
    {
      cwd: app.isPackaged ? process.resourcesPath : undefined,
      detached: true
    }
  );

  captainProcess.stdout?.on('data', (data) => {
    log.info(data.toString());
    sendToStatusBar(data.toString());
  });

  captainProcess.stderr?.on('data', (data) => {
    log.error(data.toString());
    sendToStatusBar(data.toString());
  });

  captainProcess.on('error', (error) => {
    log.error(error.message);
    sendToStatusBar(error.message);
  });
}

export async function isPortFree(port: number) {
  return new Promise((resolve) => {
    const server = http
      .createServer()
      .listen(port, '127.0.0.1', () => {
        server.close();
        resolve(true);
      })
      .on('error', () => {
        resolve(false);
      });
  });
}

export async function killProcess(port: number) {
  if (await isPortFree(port)) return;
  await execCommand(
    new Command({
      darwin: `kill -9 $(lsof -t -i :${port})`,
      linux: `kill -9 $(lsof -t -i :${port})`,
      win32: `FOR /F "tokens=5" %i IN ('netstat -aon ^| find "${port}"') DO Taskkill /F /PID %i`
    })
  );
}
