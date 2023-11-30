import { Sliders } from 'lucide-react';
import { Handle, Position } from 'reactflow';

const SliderBlock = () => {
  return (
    <>
      <div className="border p-4">
        <Sliders />
      </div>
      <Handle type="source" position={Position.Right} id="value" />
    </>
  );
};

export default SliderBlock;
