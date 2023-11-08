import { useQuery } from '@tanstack/react-query';
import { Badge } from '../ui/Badge';
import { BackendStatus } from '@/types/status';
import axios from 'axios';
import { useState } from 'react';

const StatusBar = (): JSX.Element => {
  const [message, setMessage] = useState<string>('');
  const { data, isSuccess } = useQuery({
    queryKey: ['status'],
    queryFn: async (): Promise<BackendStatus> => {
      const { data } = await axios.get('http://localhost:2333/status/');
      const parsedData = BackendStatus.safeParse(data);

      if (!parsedData.success) {
        throw new Error('captain returned an unknown status');
      }

      return parsedData.data;
    },
    refetchInterval: 1000,
    staleTime: 1000,
    retry: false
  });

  // Listen for messages from the main process
  window.electron.ipcRenderer.on('message', (_, data) => {
    console.log(data);
    setMessage(data);
  });

  return (
    <div className="flex h-12 items-center gap-2 bg-background p-4">
      {isSuccess && data.status === 'OK' ? (
        <Badge>Operational</Badge>
      ) : (
        <Badge variant={'destructive'}>Disconnected</Badge>
      )}
      <div className="text-sm">{message}</div>
    </div>
  );
};

export default StatusBar;
