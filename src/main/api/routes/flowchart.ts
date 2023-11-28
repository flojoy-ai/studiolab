import { t } from '../trpc';
import { WebSocket } from 'ws';
import { ipcMain } from 'electron';
import { z } from 'zod';
import log from 'electron-log/main';

export const flowchartRouter = t.router({
  startFlowchart: t.procedure.input(z.string()).mutation((opts) => {
    const websocket = new WebSocket('ws://127.0.0.1:2333/blocks/flowchart');
    websocket.on('open', () => {
      websocket.send(opts.input);
    });
    websocket.on('message', (data) => {
      ipcMain.emit('flowchart-response', data.toString());
      log.debug('ws server responded with', data.toString());
    });
    ipcMain.on('flowchart-update', (data) => {
      log.info('sending update to ws', data);
      websocket.send(data.toString());
    });
  }),
  updateFlowchart: t.procedure.input(z.string()).mutation((opts) => {
    log.info('trpc udpate received');
    // log.info(opts.input);
    ipcMain.emit('flowchart-update', opts.input);
  }),
  cancelFlowchart: t.procedure.mutation(async () => {
    // websocket?.close();
    // websocket = null;
  })
});
