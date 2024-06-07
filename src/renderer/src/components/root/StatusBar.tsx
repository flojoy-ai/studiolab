import { Badge } from '../ui/Badge';
import { useEffect, useState } from 'react';
import { useLifecycleStore } from '@/stores/lifecycle';
import { ModeToggle } from './ModeToggle';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Button } from '../ui/Button';
import { trpcClient } from '@/main';

const StatusBar = (): JSX.Element => {
  const { setCaptainReady, captainReady, setFlowRunning } = useLifecycleStore((state) => ({
    setCaptainReady: state.setCaptainReady,
    captainReady: state.captainReady,
    setFlowRunning: state.setFlowRunning
  }));

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
      setFlowRunning(false);
    }
  }, [readyState]);

  useEffect(() => {
    // Listen for messages from the main process
    window.electron.ipcRenderer.on('status-bar-logging', (_, data) => {
      setMessage(data);
    });
  }, []);

  return (
    <div className="statusbar flex items-center gap-2 bg-background p-4">
      {captainReady ? (
        <Badge>Operational</Badge>
      ) : (
        <Badge variant={'destructive'}>Disconnected</Badge>
      )}
      <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">{message}</div>
      <div className="grow" />
      <Button size="sm" variant="secondary" onClick={async () => trpcClient.openLogFolder.mutate()}>
        Open Full Logs
      </Button>
      <ModeToggle />
    </div>
  );
};

export default StatusBar;
