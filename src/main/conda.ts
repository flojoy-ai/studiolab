import { exec } from 'child_process';

export function checkCondaInstallation(): Promise<string> {
  console.log('checkCondaInstallation');
  return new Promise((resolve, reject) => {
    exec('conda --version', (error, stdout, stderr) => {
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

export function getCondaEnvList(): Promise<string> {
  console.log('getCondaEnvList');
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

export function createFlojoyStudioEnv(): Promise<string> {
  console.log('createFlojoyStudioEnv');
  return new Promise((resolve, reject) => {
    exec('conda create --name flojoy-studio python==3.10 --json', (error, stdout, stderr) => {
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

export function upgradePip(): Promise<string> {
  console.log('upgradePip');
  return new Promise((resolve, reject) => {
    exec('conda run -n flojoy-studio pip install --upgrade pip', (error, stdout, stderr) => {
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

export function installPoetry(): Promise<string> {
  console.log('installPoetry');
  return new Promise((resolve, reject) => {
    exec('conda run -n flojoy-studio pip install poetry', (error, stdout, stderr) => {
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

export function installDependencies(): Promise<string> {
  console.log('installDependencies');
  return new Promise((resolve, reject) => {
    exec('conda run -n flojoy-studio poetry install', (error, stdout, stderr) => {
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
