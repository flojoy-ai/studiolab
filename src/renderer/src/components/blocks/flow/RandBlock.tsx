import { Handle, Position } from 'reactflow';
import { BlockProps } from '@/types/block';

const RandBlock = ({ data }: BlockProps) => {
  const { label } = data;

  return (
    <>
      <div className="border p-2">rand</div>
      <Handle type="target" position={Position.Left} id="x" />
      <Handle type="source" position={Position.Right} id="value" />
    </>
  );
};

export default RandBlock;
