import { Handle, Position } from 'reactflow';
import { BlockProps } from '@/types/block';
import { useBlockState } from '@/hooks/useBlockState';
import { Switch } from '@/components/ui/Switch';

const ToggleBlock = ({ id }: BlockProps) => {
  const [value, update] = useBlockState(id, false);

  return (
    <>
      <div className="rounded-md border p-4">
        <div className="flex justify-center">{value}</div>
        <Switch onCheckedChange={update} checked={value} />
      </div>
      <Handle type="source" position={Position.Right} id="value" />
    </>
  );
};

export default ToggleBlock;
