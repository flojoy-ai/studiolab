import { Badge } from '../ui/Badge';
import { useEffect, useState } from 'react';
import { useLifecycleStore } from '@/stores/lifecycle';
import { ModeToggle } from './ModeToggle';
import { Button } from '../ui/Button';
import { trpcClient } from '@/main';

const StatusBar = (): JSX.Element => {
  const { setCaptainReady, captainReady, setRunning } = useLifecycleStore((state) => ({
    setCaptainReady: state.setCaptainReady,
    captainReady: state.captainReady,
    setRunning: state.setRunning
  }));

  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const intervalId = setInterval(async () => {
      try {
        await trpcClient.checkHealth.query();
        setCaptainReady(true);
      } catch (e) {
        setCaptainReady(false);
        setRunning(false);
      }
    }, 1000); // poll every second
    // TODO: find a better way to do health check

    return () => {
      clearInterval(intervalId);
    };
  }, []);

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
