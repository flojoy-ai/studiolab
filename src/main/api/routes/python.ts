import log from 'electron-log/main';
import { t } from '../trpc';

import grpc from '@grpc/grpc-js';

import {
  FlowchartCancelRequest,
  FlowchartControlRequest,
  FlowchartRequest,
  // FlowchartRequest,
  // FlowchartReply,
  FlowchartStartRequest
} from '../../../../protos/flowchart_pb';
import { FlowchartClient } from '../../../../protos/flowchart_grpc_pb';

const client = new FlowchartClient('localhost:2333', grpc.credentials.createInsecure());
const request = new FlowchartStartRequest();

export const pythonRouter = t.router({
  streamTest: t.procedure.mutation(async () => {
    return new Promise((resolve, reject) => {
      const rtn = client.runFlowchart();
      rtn.write(new FlowchartRequest().setCancel(new FlowchartCancelRequest()));
      // rtn.write(new FlowchartRequest().setStart(new FlowchartStartRequest()));
      // rtn.write(new FlowchartRequest().setControl(new FlowchartControlRequest()));
      rtn.on('data', (data) => {
        log.info(data);
      });
    });
  })
});
