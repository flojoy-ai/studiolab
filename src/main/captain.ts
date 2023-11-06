import { PythonShell } from 'python-shell';

export function spawnCaptain(pythonPath: string, entryPath: string): void {
  console.log(pythonPath, entryPath);
  console.log('spawnCaptain');

  try {
    global.captainProcess = new PythonShell(entryPath, {
      pythonPath: pythonPath,
      mode: 'text'
    });
    global.captainProcess.on('message', (message) => {
      console.log(message);
    });
  } catch (error) {
    console.log(error);
  }
}

export function killCaptain(): void {
  (global.captainProcess as PythonShell).kill();
}
