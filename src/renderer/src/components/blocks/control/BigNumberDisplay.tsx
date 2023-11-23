import { BlockProps } from '@/types/block';
import { useBlockState } from '@/hooks/useBlockState';

const BigNumberDisplay = ({ id }: BlockProps) => {
  const [value] = useBlockState<number>(id);
  console.log(value);

  return (
    <>
      <div className="flex h-32 w-32 items-center justify-center border">
        <div className="text-4xl">{value}</div>
        <div className="">{id}</div>
      </div>
    </>
  );
};

export default BigNumberDisplay;
