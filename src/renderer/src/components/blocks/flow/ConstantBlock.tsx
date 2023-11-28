import { Handle, Position } from 'reactflow';

const ConstantBlock = () => {
  return (
    <>
      <div className="border p-2">2</div>
      <Handle type="source" position={Position.Right} id="value" />
    </>
  );
};

export default ConstantBlock;
