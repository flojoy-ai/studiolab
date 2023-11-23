import { Handle, Position } from 'reactflow';
import { BlockProps } from '@/types/block';

const BigNumberBlock = ({ id }: BlockProps) => {
  return (
    <>
      <div className="flex h-32 w-32 items-center justify-center border">
        <div className="">Big Number Block {id}</div>
      </div>
      <Handle type="target" position={Position.Left} id="x" />
    </>
  );
};

export default BigNumberBlock;
