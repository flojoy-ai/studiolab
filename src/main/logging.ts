import { app, ipcMain, shell } from 'electron';

export function openLogFolder(): void {
  shell.openPath(app.getPath('logs'));
}

export function sendToStatusBar(message: string): void {
  ipcMain.emit('status-bar-logging', message);
}
