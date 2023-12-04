import { Input } from '@/components/ui/Input';
import { useFlowchartStore } from '@/stores/flowchart';
import { BlockProps } from '@/types/block';
import { Handle, Position } from 'reactflow';

const ConstantBlock = ({ id, data }: BlockProps) => {
  const update = useFlowchartStore((state) => state.updateIntrinsicParameter);

  return (
    <>
      {/*TODO: Find a more typesafe way to do this*/}
      <div className="w-24 p-1">
        <Input
          onChange={(e) => update(id, 'val', parseInt(e.target.value, 10))}
          type="number"
          value={data.intrinsic_parameters['val']}
        />
      </div>
      <Handle type="source" position={Position.Right} id="value" />
    </>
  );
};

export default ConstantBlock;
