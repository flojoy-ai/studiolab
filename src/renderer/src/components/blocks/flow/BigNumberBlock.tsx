import { Hash } from 'lucide-react';
import { Handle, Position } from 'reactflow';

const BigNumberBlock = () => {
  return (
    <>
      <div className="border p-2">
        <Hash />
      </div>
      <Handle type="target" position={Position.Left} id="x" />
    </>
  );
};

export default BigNumberBlock;
