import { SetupStatus } from '@/types/status';
import { CheckCircle, CircleDashed, CircleDotDashed, XCircle } from 'lucide-react';

const SetupStep = ({ status, message }: Omit<SetupStatus, 'stage'>): JSX.Element => {
  return (
    <div className="flex gap-2 p-2">
      {status === 'running' && <CircleDotDashed className="animate-spin" />}
      {status === 'completed' && <CheckCircle />}
      {status === 'pending' && <CircleDashed />}
      {status === 'error' && <XCircle />}
      <div>{message}</div>
    </div>
  );
};

export default SetupStep;
