import { Handle, Position } from 'reactflow';

const FunctionBlock = () => {
  return (
    <>
      <div className="border px-64 py-32">Seq</div>
      <Handle type="source" position={Position.Right} id="out" />
    </>
  );
};

export default FunctionBlock;
