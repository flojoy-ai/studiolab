import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';

const Flow = (): JSX.Element => {
  const edges = [{ id: '1-2', source: '1', target: '2' }];

  const nodes = [
    {
      id: '1',
      data: { label: 'Hello' },
      position: { x: 0, y: 0 },
      type: 'input'
    },
    {
      id: '2',
      data: { label: 'World' },
      position: { x: 100, y: 100 }
    }
  ];
  return (
    <div className="main-content m-4 grow rounded-lg bg-background">
      <ReactFlow proOptions={{ hideAttribution: true }} nodes={nodes} edges={edges}>
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default Flow;
