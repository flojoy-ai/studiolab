import { BlockProps } from '@/types/block';

import { Handle, Position } from 'reactflow';

const SliderBlock = ({ id }: BlockProps) => {
  return (
    <div className="rounded-md border p-4">
      <div className="flex justify-center">Slider Block {id}</div>
      <Handle type="source" position={Position.Right} id="value" />
    </div>
  );
};

export default SliderBlock;
