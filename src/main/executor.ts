import { exec } from 'child_process';
import { app } from 'electron';
import log from 'electron-log/main';
import { Command } from './command';
import { openLogFolder } from './logging';

export function execCommand(command: Command): Promise<string> {
  log.info('execCommand: ' + command);
  return new Promise((resolve, reject) => {
    exec(
      command.getCommand(),
      { cwd: app.isPackaged ? process.resourcesPath : undefined },
      (error, stdout, stderr) => {
        if (error) {
          log.error(error.message);
          openLogFolder();
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
