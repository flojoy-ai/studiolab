import BlockLibrary from '@/components/flow/BlockLibrary';
import FlowCanvas from '@/components/flow/FlowCanvas';

const Flow = (): JSX.Element => {
  return (
    <div className="main-content flex  bg-muted py-4">
      <BlockLibrary />
      <div className="px-2"></div>
      <FlowCanvas />
      <div className="px-2"></div>
    </div>
  );
};

export default Flow;
