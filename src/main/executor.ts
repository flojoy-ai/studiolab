import { exec } from 'child_process';
import { app } from 'electron';
import log from 'electron-log/main';

export function execCommand(command: string): Promise<string> {
  log.info('execCommand: ' + command);
  return new Promise((resolve, reject) => {
    exec(
      command,
      { cwd: app.isPackaged ? process.resourcesPath : undefined },
      (error, stdout, stderr) => {
        if (error) {
          log.error(error.message);
          reject(error.message);
        }
        log.info(stdout);
        if (stderr) {
          log.error(stderr);
        }
        resolve(stdout);
      }
    );
  });
}
