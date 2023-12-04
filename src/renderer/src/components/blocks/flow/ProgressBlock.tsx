import { Percent } from 'lucide-react';
import { Handle, Position } from 'reactflow';

const ProgressBlock = () => {
  return (
    <>
      <div className="border p-4">
        <Percent />
      </div>
      <Handle type="target" position={Position.Left} id="x" />
    </>
  );
};

export default ProgressBlock;
