import { ToggleLeft } from 'lucide-react';
import { Handle, Position } from 'reactflow';

const ToggleBlock = () => {
  return (
    <>
      <div className="border p-2">
        <ToggleLeft />
      </div>
      <Handle type="source" position={Position.Right} id="value" />
    </>
  );
};

export default ToggleBlock;
