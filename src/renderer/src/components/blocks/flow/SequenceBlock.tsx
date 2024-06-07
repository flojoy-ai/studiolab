import { Handle, Position } from 'reactflow';
import { BlockProps } from '@/types/block';

const SequenceBlock = ({ data }: BlockProps) => {
  const { label } = data;

  return (
    <>
      <div className="border p-2">{label}</div>
      <Handle type="source" position={Position.Right} id="value" />
      <Handle className="!top-2" type="target" position={Position.Left} id="start" />
      <Handle className="!top-6" type="target" position={Position.Left} id="stop" />
      <Handle className="!top-10" type="target" position={Position.Left} id="step" />
    </>
  );
};

export default SequenceBlock;
