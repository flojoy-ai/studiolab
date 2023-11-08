import log from 'electron-log/main';
import { execCommand } from './executor';
import { app } from 'electron';
import { Command } from './command';
import { ChildProcess, execSync, spawn } from 'child_process';
import { sendToStatusBar } from './logging';

export function checkPythonInstallation(): Promise<string> {
  return execCommand(
    new Command({
      darwin: 'python3.11 --version',
      win32: 'python -c "import sys; assert sys.version_info >= (3, 11)" && python --version',
      linux: 'python3.11 --version'
    })
  );
}

export function installPipx(): Promise<string> {
  return execCommand(
    new Command({
      darwin: 'python3.11 -m pip install --user pipx',
      win32: 'python -m pip install --user pipx',
      linux: 'python3.11 -m pip install --user pipx --break-system-packages'
    })
  );
}

export function pipxEnsurepath(): Promise<string> {
  return execCommand(
    new Command({
      darwin: 'python3.11 -m pipx ensurepath',
      win32: 'python -m pipx ensurepath',
      linux: 'python3.11 -m pipx ensurepath'
    })
  );
}

export function installPoetry(): Promise<string> {
  return execCommand(
    new Command({
      darwin: 'python3.11 -m pip install poetry',
      win32: 'python -m pip install poetry',
      linux: 'python3 -m pip install poetry'
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
    win32: 'poetry run python main.py',
    linux: 'poetry run python3 main.py'
  });

  log.info('execCommand: ' + command.getCommand());

  global.captainProcess = spawn(
    command.getCommand().split(' ')[0],
    command.getCommand().split(' ').slice(1),
    {
      cwd: app.isPackaged ? process.resourcesPath : undefined
    }
  );

  global.captainProcess.stdout?.on('data', (data) => {
    log.info(data.toString());
    sendToStatusBar(data.toString());
  });

  global.captainProcess.stderr?.on('data', (data) => {
    log.error(data.toString());
    sendToStatusBar(data.toString());
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

export function killCaptain(): boolean {
  if (process.platform === 'win32') {
    execSync(`taskkill -F -T -PID ${(global.captainProcess as ChildProcess).pid}`);
  }
  return (global.captainProcess as ChildProcess).kill();
}
