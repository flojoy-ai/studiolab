import { useFlowchartStore } from '@/stores/flowchart';
import { UIState, useUIStateStore } from '@/stores/ui';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '../ui/Button';
import useWebSocket from 'react-use-websocket';
import { SOCKET_URL } from '@/utils/constants';
import { sendEvent } from '@/utils/sendEvent';

type Props = {
  onStart: () => void;
};

const FlowControlsTopLeft = ({ onStart }: Props): JSX.Element => {
  const { sendMessage } = useWebSocket(SOCKET_URL, { share: true });
  const { running, setRunning } = useFlowchartStore((state) => ({
    running: state.running,
    setRunning: state.setRunning
  }));
  const { isBlocksLibraryActive, setIsBlocksLibraryActive } = useUIStateStore(
    useShallow((state: UIState) => ({
      isBlocksLibraryActive: state.isBlocksLibraryActive,
      setIsBlocksLibraryActive: state.setIsBlocksLibraryActive
    }))
  );

  const onCancel = () => {
    sendEvent(sendMessage, { event_type: 'cancel' });
    setRunning(false);
  };

  return (
    <div className="absolute z-50 flex gap-2 p-4">
      <Button
        onClick={(): void => {
          setIsBlocksLibraryActive(!isBlocksLibraryActive);
        }}
      >
        Add Blocks
      </Button>
      {!running ? (
        <Button onClick={onStart}>Start</Button>
      ) : (
        <Button onClick={onCancel}>Cancel</Button>
      )}
    </div>
  );
};

export default FlowControlsTopLeft;
