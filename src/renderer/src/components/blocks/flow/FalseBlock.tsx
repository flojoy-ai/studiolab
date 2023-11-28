import { Handle, Position } from 'reactflow';

const FalseBlock = () => {
  return (
    <>
      <div className="border p-2">false</div>
      <Handle type="source" position={Position.Right} id="value" />
    </>
  );
};

export default FalseBlock;
