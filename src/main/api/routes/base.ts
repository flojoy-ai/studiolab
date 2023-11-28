import { openLogFolder } from '../../logging';
import { app } from 'electron';
import { spawnBlocksLibraryWindow } from '../../windows';
import { t } from '../trpc';

import grpc from '@grpc/grpc-js';

import { HelloRequest } from '../../../../protos/hello_pb';
import { GreeterClient } from '../../../../protos/hello_grpc_pb';

const client = new GreeterClient('localhost:2333', grpc.credentials.createInsecure());
const request = new HelloRequest();

export const baseRouter = t.router({
  openLogFolder: t.procedure.mutation(() => {
    openLogFolder();
  }),
  restartFlojoyStudio: t.procedure.mutation(() => {
    app.relaunch();
    app.exit();
  }),
  spawnBlockLibraryWindow: t.procedure.mutation(async () => {
    await spawnBlocksLibraryWindow();
  }),
  checkHealth: t.procedure.query(async () => {
    return new Promise((resolve, reject) => {
      client.sayHello(request, function (err, response) {
        if (err) {
          reject(err);
        }
        try {
          resolve(response.getMessage());
        } catch (err) {
          reject(err);
        }
      });
    });
  })
});
