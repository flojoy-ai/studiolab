import { PYTHON_BACKEND_URI, t } from '../trpc';
import { WebSocket } from 'ws';
import { ipcMain } from 'electron';
import { z } from 'zod';

export const flowchartRouter = t.router({
  startFlowchart: t.procedure.input(z.string()).mutation((opts) => {
    const websocket = new WebSocket(`ws://${PYTHON_BACKEND_URI}/blocks/flowchart`);
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
