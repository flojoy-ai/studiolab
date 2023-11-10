import { Badge } from '../ui/Badge';
import { useEffect, useState } from 'react';
import { useCaptainStateStore } from '@/stores/lifecycle';
import { ModeToggle } from './ModeToggle';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const StatusBar = (): JSX.Element => {
  const setCaptainReady = useCaptainStateStore((state) => state.setReady);
  const captainReady = useCaptainStateStore((state) => state.ready);

  const [message, setMessage] = useState<string>('');

  const { readyState } = useWebSocket('ws://localhost:2333/status', {
    retryOnError: true,
    shouldReconnect: () => true
  });

  useEffect(() => {
    if (readyState === ReadyState.OPEN) {
      setCaptainReady(true);
    } else {
      setCaptainReady(false);
    }
  }, [readyState]);

  // Listen for messages from the main process
  window.electron.ipcRenderer.on('status-bar-logging', (_, data) => {
    setMessage(data);
  });

  return (
    <div className="statusbar flex items-center gap-2 bg-background p-4">
      {captainReady ? (
        <Badge>Operational</Badge>
      ) : (
        <Badge variant={'destructive'}>Disconnected</Badge>
      )}
      <div className="grow text-sm">{message}</div>
      <ModeToggle />
    </div>
  );
};

export default StatusBar;
