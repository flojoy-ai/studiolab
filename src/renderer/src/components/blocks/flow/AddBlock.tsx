import { Handle, Position } from 'reactflow';
import { Plus } from 'lucide-react';

const AddBlock = () => {
  return (
    <>
      <div className="border p-2">
        <Plus />
      </div>
      <Handle type="source" position={Position.Right} id="value" />
      <Handle className="!top-3" type="target" position={Position.Left} id="x" />
      <Handle className="!top-7" type="target" position={Position.Left} id="y" />
    </>
  );
};

export default AddBlock;
