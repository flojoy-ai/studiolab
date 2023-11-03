import { exec } from 'child_process';

export function getCondaEnvList(): Promise<string> {
  return new Promise((resolve, reject) => {
    exec('conda env list --json', (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        reject(error.message);
      }
      console.log(stdout);
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        reject(stderr);
      }
      resolve(stdout);
    });
  });
}
