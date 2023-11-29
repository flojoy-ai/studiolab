import { BlockProps } from '@/types/block';
import { useBlockState } from '@/hooks/useBlockState';

const BigNumberDisplay = ({ id }: BlockProps) => {
  const [value] = useBlockState<number>(id);

  return (
    <>
      <div className="flex h-32 w-32 items-center justify-center border">
        <div className="text-4xl">{value}</div>
      </div>
    </>
  );
};

export default BigNumberDisplay;
