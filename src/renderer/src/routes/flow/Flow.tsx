import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

const Flow = (): JSX.Element => {
  return (
    <div className="main-content m-4 flex grow flex-col items-center rounded-lg bg-background">
      <ReactFlow proOptions={{ hideAttribution: true }}>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default Flow;
