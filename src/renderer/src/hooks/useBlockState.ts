// import { FlowStateUpdateEvent } from '@/types/flow';
import { useEffect, useState } from 'react';
import { sendEvent } from '@/utils/sendEvent';
import { useLifecycleStore } from '@/stores/lifecycle';
import { trpcClient } from '@/main';
import { useShallow } from 'zustand/react/shallow';

export const useBlockState = <T>(
  id: string,
  defaultValue?: T
): [T | undefined, (data: T) => void] => {
  const [state, setState] = useState<T | undefined>(defaultValue);

  const { flowReady, setFlowReady } = useLifecycleStore(
    useShallow((state) => ({
      flowReady: state.flowReady,
      setFlowReady: state.setFlowReady
    }))
  );

  const sendMessage = (msg: string) => {
    trpcClient.updateFlowchart.mutate(msg);
  };

  useEffect(() => {
    // TODO: Joey, this is a temporary fix for the flowchart not updating
    // should move the ready event to somewhere else insteaf of in every
    // useBlockState which is too expensive
    window.electron.ipcRenderer.on('flowchart-response', (_, data) => {
      const stateUpdate = JSON.parse(data);

      if (stateUpdate.event_type === 'state_update') {
        if (stateUpdate.id === id) {
          setState(stateUpdate.data);
        }
      }

      if (stateUpdate.event_type === 'ready') {
        console.log('Flowchart ready');
        setFlowReady(true);
      }
    });
  }, []);

  useEffect(() => {
    if (flowReady && state !== undefined && defaultValue !== undefined) {
      console.log('Sending initial updates');
      update(state);
    }
  }, [flowReady]);

  const update = (data: T) => {
    if (flowReady) {
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
