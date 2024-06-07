import { Handle, Position } from 'reactflow';

const RandBlock = () => {
  return (
    <>
      <div className="border p-2">rand</div>
      <Handle type="target" position={Position.Left} id="x" />
      <Handle type="source" position={Position.Right} id="value" />
    </>
  );
};

export default RandBlock;
