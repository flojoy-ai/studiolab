import { SetupStatus } from '@/types/status';
import { AlertCircle, CheckCircle, CircleDashed, CircleDotDashed, XCircle } from 'lucide-react';

const SetupStep = ({ status, message }: Omit<SetupStatus, 'stage'>): JSX.Element => {
  return (
    <div className="main-content flex items-center gap-2 p-2">
      <div>
        {status === 'running' && <CircleDotDashed className="animate-spin" />}
        {status === 'completed' && <CheckCircle />}
        {status === 'pending' && <CircleDashed />}
        {status === 'warning' && <AlertCircle />}
        {status === 'error' && <XCircle />}
      </div>
      <div>{message}</div>
    </div>
  );
};

export default SetupStep;
