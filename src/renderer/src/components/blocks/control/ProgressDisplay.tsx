import { BlockProps } from '@/types/block';
import { useBlockState } from '@/hooks/useBlockState';
import { Progress } from '@/components/ui/Progress';

const ProgressDisplay = ({ id }: BlockProps) => {
  const [value] = useBlockState<number>(id);

  return (
    <div className="flex w-64 items-center gap-2 border p-4">
      <Progress value={value} />
      <div>{value}%</div>
    </div>
  );
};

export default ProgressDisplay;
