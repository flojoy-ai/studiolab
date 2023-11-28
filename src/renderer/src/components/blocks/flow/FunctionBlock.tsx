import { Handle, Position } from 'reactflow';
import { BlockProps } from '@/types/block';

const FunctionBlock = ({ data }: BlockProps) => {
  const { label } = data;

  return (
    <>
      <div className="border px-64 py-32">Seq</div>
      <Handle type="source" position={Position.Right} id="out" />
    </>
  );
};

export default FunctionBlock;
