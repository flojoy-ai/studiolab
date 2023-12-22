import { Handle, Position } from 'reactflow';
import { BlockProps } from '@/types/block';

const ConditionalBlock = ({ data }: BlockProps) => {
  const { label } = data;

  return (
    <>
      <div className="border p-6">{label}</div>
      <Handle type="target" position={Position.Left} id="b" />
      <Handle className="!top-6" type="source" position={Position.Right} id="true" />
      <Handle className="!top-12" type="source" position={Position.Right} id="false" />
    </>
  );
};

export default ConditionalBlock;
