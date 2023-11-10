import { FlowStateUpdateEvent } from '@/types/flow';
import { SOCKET_URL } from '@/utils/constants';
import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { useFlowchartStore } from '@/stores/flowchart';
import { sendEvent } from '@/utils/sendEvent';

export const useBlockState = <T>(
  id: string,
  defaultValue?: T
): [T | undefined, (data: T) => void] => {
  const [state, setState] = useState<T | undefined>(defaultValue);
  const { sendMessage, lastMessage } = useWebSocket(SOCKET_URL, { share: true });
  const running = useFlowchartStore((state) => state.running);

  useEffect(() => {
    if (lastMessage !== null) {
      // TODO: Potential performance issues with this
      // Each time there is a state update, each block
      // that calls this hook must deserialize the socket message
      // to check if the state update is for that block
      const stateUpdate = JSON.parse(lastMessage.data) as FlowStateUpdateEvent;
      if (stateUpdate.id === id) {
        setState(stateUpdate.data);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    if (running && state !== undefined && defaultValue !== undefined) {
      update(state);
    }
  }, [running]);

  const update = (data: T) => {
    if (running) {
      sendEvent(sendMessage, {
        event_type: 'ui',
        ui_input_id: id,
        value: data
      });
    } else {
      setState(data);
    }
  };

  return [state, update];
};
