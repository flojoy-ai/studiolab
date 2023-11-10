import { useQuery } from '@tanstack/react-query';
import { Badge } from '../ui/Badge';
import { BackendStatus } from '@/types/status';
import axios from 'axios';
import { useState } from 'react';
import { useCaptainStateStore } from '@/stores/lifecycle';
import { ModeToggle } from './ModeToggle';

const StatusBar = (): JSX.Element => {
  const [message, setMessage] = useState<string>('');
  const setCaptainReady = useCaptainStateStore((state) => state.setReady);
  const { data, isSuccess } = useQuery({
    queryKey: ['status'],
    queryFn: async (): Promise<BackendStatus> => {
      const { data } = await axios.get('http://localhost:2333/status/');
      const parsedData = BackendStatus.safeParse(data);

      if (!parsedData.success) {
        setCaptainReady(false);
        throw new Error('captain returned an unknown status');
      }

      setCaptainReady(true);
      return parsedData.data;
    },
    refetchInterval: 1000,
    staleTime: 1000,
    retry: false
  });

  // Listen for messages from the main process
  window.electron.ipcRenderer.on('status-bar-logging', (_, data) => {
    setMessage(data);
  });

  return (
    <div className="statusbar flex items-center gap-2 bg-background p-4">
      {isSuccess && data.status === 'OK' ? (
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
