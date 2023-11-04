import { FlowSocketMessage } from '@/types/flow';
import { SOCKET_URL } from '@/utils/constants';
import useWebSocket from 'react-use-websocket';

export const useSendEvent = () => {
  const { sendMessage } = useWebSocket(SOCKET_URL, { share: true });

  return (event: FlowSocketMessage['event']) => {
    sendMessage(
      JSON.stringify({
        event
      })
    );
  };
};
