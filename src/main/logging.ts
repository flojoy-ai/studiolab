import { app, shell } from 'electron';

export function openLogFolder(): void {
  shell.openPath(app.getPath('logs'));
}
