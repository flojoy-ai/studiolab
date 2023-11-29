import { FlowStateUpdateEvent } from '@/types/flow';
import { useEffect, useState } from 'react';
import { sendEvent } from '@/utils/sendEvent';
import { useLifecycleStore } from '@/stores/lifecycle';
import { trpcClient } from '@/main';

export const useBlockState = <T>(
  id: string,
  defaultValue?: T
): [T | undefined, (data: T) => void] => {
  const [state, setState] = useState<T | undefined>(defaultValue);
  const running = useLifecycleStore((state) => state.running);

  const sendMessage = (msg: string) => {
    trpcClient.updateFlowchart.mutate(msg);
  };

  useEffect(() => {
    // Listen for messages from the main process
    window.electron.ipcRenderer.on('flowchart-response', (_, data) => {
      // console.log('received message', data);
      const stateUpdate = JSON.parse(data) as FlowStateUpdateEvent;
      if (stateUpdate.id === id) {
        // console.log('setting state', stateUpdate.data);
        setState(stateUpdate.data);
      }
    });
  }, []);

  useEffect(() => {
    if (running && state !== undefined && defaultValue !== undefined) {
      update(state);
    }
  }, [running]);

  const update = (data: T) => {
    if (running) {
      sendEvent(sendMessage, {
        event_type: 'control',
        block_id: id,
        value: data
      });
    } else {
      setState(data);
    }
  };

  return [state, update];
};
