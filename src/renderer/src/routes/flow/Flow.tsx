import 'reactflow/dist/style.css';
import BlockLibrary from '@/components/flow/BlockLibrary';
import FlowCanvas from '@/components/flow/FlowCanvas';

const Flow = (): JSX.Element => {
  return (
    <div className="main-content flex rounded-lg bg-muted p-4">
      <BlockLibrary />
      <FlowCanvas />
    </div>
  );
};

export default Flow;
