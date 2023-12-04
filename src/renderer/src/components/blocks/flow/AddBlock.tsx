import { Handle, Position } from 'reactflow';
import { Plus } from 'lucide-react';

const AddBlock = () => {
  return (
    <div className="border p-4">
      <Plus />
      <Handle type="source" position={Position.Right} id="value" />
      <Handle className="!top-1/4" type="target" position={Position.Left} id="x" />
      <Handle className="!top-3/4" type="target" position={Position.Left} id="y" />
    </div>
  );
};

export default AddBlock;
