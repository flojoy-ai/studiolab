import { FlowSocketMessage } from '@/types/flow';

export const sendEvent = (
  sendMessage: (msg: string) => void,
  event: FlowSocketMessage['event']
) => {
  sendMessage(
    JSON.stringify({
      event
    })
  );
};
