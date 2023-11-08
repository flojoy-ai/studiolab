import { BrowserWindow, app, shell } from 'electron';

export function openLogFolder(): void {
  shell.openPath(app.getPath('logs'));
}

export function sendToStatusBar(message: string): void {
  if (global.mainWindow) {
    (global.mainWindow as BrowserWindow).webContents.send('message', message);
  }
}
