import { Input } from '@/components/ui/Input';
import { useBlockUpdate } from '@/stores/flowchart';
import { BlockProps } from '@/types/block';
import { Handle, Position } from 'reactflow';

const ConstantBlock = ({ id, data }: BlockProps) => {
  const updateBlock = useBlockUpdate(id);

  return (
    <>
      {/*TODO: Find a more typesafe way to do this*/}
      <div className="w-24 p-1">
        <Input
          onChange={(e) =>
            updateBlock((block) => {
              block.data.intrinsic_parameters['val'] = parseInt(e.target.value, 10);
            })
          }
          type="number"
          value={data.intrinsic_parameters['val']}
        />
      </div>
      <Handle type="source" position={Position.Right} id="value" />
    </>
  );
};

export default ConstantBlock;
