import { Handle, Position } from 'reactflow';

const FibsBlock = () => {
  return (
    <>
      <div className="border p-3">Fibs</div>
      <Handle type="target" position={Position.Left} id="x" />
      <Handle type="source" position={Position.Right} id="value" />
    </>
  );
};

export default FibsBlock;
