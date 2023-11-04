import { FlowStateUpdateEvent } from '@/types/flow';
import { SOCKET_URL } from '@/utils/constants';
import { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
import { useSendEvent } from './useSocket';

const blockState = new Map<string, any>();

export const useBlockState = <T>(
  id: string,
  defaultValue?: T
): [T | undefined, (data: T) => void] => {
  const sendEvent = useSendEvent();

  const val = blockState.get(id) as T;
  const update = (data: T) =>
    sendEvent({
      event_type: 'ui',
      ui_input_id: id,
      value: data
    });

  return [val ?? defaultValue, update];
};

export const useUpdateBlockState = () => {
  const { lastMessage } = useWebSocket(SOCKET_URL, { share: true });

  useEffect(() => {
    if (lastMessage !== null) {
      const jsonMsg = lastMessage.data.replace(/'/g, '"');
      console.log('GOT MESSAGE: ' + jsonMsg);
      const stateUpdate = JSON.parse(jsonMsg) as FlowStateUpdateEvent;

      blockState.set(stateUpdate.id, stateUpdate.data);
    }
  }, [lastMessage]);
};
