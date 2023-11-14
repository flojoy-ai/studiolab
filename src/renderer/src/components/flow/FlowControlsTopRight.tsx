import { Button } from '../ui/Button';

import { SOCKET_URL } from '@/utils/constants';

import useWebSocket, { ReadyState } from 'react-use-websocket';
import 'reactflow/dist/style.css';
import { useFlowchartStore } from '@/stores/flowchart';
import { sendEvent } from '@/utils/sendEvent';
import { useShallow } from 'zustand/react/shallow';

const FlowControlsTopRight = (): JSX.Element => {
  const { sendMessage, readyState } = useWebSocket(SOCKET_URL, { share: true });
  const { edges, nodes, running, setRunning } = useFlowchartStore(
    useShallow((state) => ({
      edges: state.edges,
      nodes: state.nodes,
      running: state.running,
      setRunning: state.setRunning
    }))
  );

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
  }[readyState];

  const onCancel = () => {
    sendEvent(sendMessage, { event_type: 'cancel' });
    setRunning(false);
  };

  const onStart = (): void => {
    if (connectionStatus === 'Open') {
      sendEvent(sendMessage, {
        event_type: 'start',
        rf: { nodes, edges }
      });
      setRunning(true);
    }
  };

  return (
    <div className="absolute right-0 z-50 flex gap-2 p-4">
      {!running ? (
        <Button onClick={onStart}>Start</Button>
      ) : (
        <Button onClick={onCancel}>Cancel</Button>
      )}
      <Button variant="destructive">Clear Canvas</Button>
    </div>
  );
};

export default FlowControlsTopRight;
