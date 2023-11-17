export function isPackaged() {
  return window.electron.process.env['NODE_ENV'] === 'production';
}
