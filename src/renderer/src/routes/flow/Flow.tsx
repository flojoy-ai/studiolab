import FlowCanvas from '@/components/flow/FlowCanvas';
import Header from '@/components/root/Header';
import StatusBar from '@/components/root/StatusBar';
import { version } from '../../../../../package.json';

const Flow = (): JSX.Element => {
  return (
    <div className="h-screen bg-muted">
      <Header title={`Control Panel ${version}`} />
      <div className="main-content flex bg-muted py-4">
        <div className="px-2"></div>
        <FlowCanvas />
        <div className="px-2"></div>
      </div>
      <StatusBar />
    </div>
  );
};

export default Flow;
