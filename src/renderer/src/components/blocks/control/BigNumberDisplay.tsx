import { Handle, Position } from 'reactflow';
import { BlockProps } from '@/types/block';
import { useBlockState } from '@/hooks/useBlockState';

const BigNumberBlock = ({ id }: BlockProps) => {
  const [value] = useBlockState<number>(id);

  return (
    <>
      <div className="flex h-32 w-32 items-center justify-center border">
        <div className="text-4xl">{value}</div>
      </div>
      <Handle type="target" position={Position.Left} id="x" />
    </>
  );
};

export default BigNumberBlock;
