import { Handle, Position } from 'reactflow';

const TrueBlock = () => {
  return (
    <>
      <div className="border p-2">true</div>
      <Handle type="source" position={Position.Right} id="value" />
    </>
  );
};

export default TrueBlock;
