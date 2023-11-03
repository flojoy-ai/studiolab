export function spawnCaptain(pythonPath: string, entryPath: string): Promise<string> {
  console.log(pythonPath, entryPath);
  return new Promise((resolve) => {
    resolve('stub');
  });
}
