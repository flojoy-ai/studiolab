import { FlowSocketMessage } from '@/types/flow';
import { SendMessage } from 'react-use-websocket/dist/lib/types';

export const sendEvent = (sendMessage: SendMessage, event: FlowSocketMessage['event']) => {
  sendMessage(
    JSON.stringify({
      event
    })
  );
};
