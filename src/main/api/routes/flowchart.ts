import { t } from '../trpc';
import { WebSocket } from 'ws';
import { ipcMain } from 'electron';
import { z } from 'zod';
// import log from 'electron-log/main';

export const flowchartRouter = t.router({
  startFlowchart: t.procedure.input(z.string()).mutation((opts) => {
    const websocket = new WebSocket('ws://127.0.0.1:2333/blocks/flowchart');
    websocket.on('open', () => {
      websocket.send(opts.input);
    });
    websocket.on('message', (data) => {
      ipcMain.emit('flowchart-response', data.toString());
      // log.debug('ws server responded with', data.toString());
    });
    ipcMain.on('flowchart-update', (data) => {
      // log.debug('sending update to ws', data);
      websocket.send(data.toString());
    });
    ipcMain.on('flowchart-cancel', (data) => {
      websocket.send(data.toString());
      websocket.close();
    });
  }),
  updateFlowchart: t.procedure.input(z.string()).mutation((opts) => {
    // log.debug('trpc udpate received');
    ipcMain.emit('flowchart-update', opts.input);
  }),
  cancelFlowchart: t.procedure.input(z.string()).mutation((opts) => {
    ipcMain.emit('flowchart-cancel', opts.input);
  })
});
