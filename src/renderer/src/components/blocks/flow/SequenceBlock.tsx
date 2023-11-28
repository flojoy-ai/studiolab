import { Handle, Position } from 'reactflow';
import { BlockProps } from '@/types/block';

const SequenceBlock = ({ data }: BlockProps) => {
  const { label } = data;

  return (
    <>
      <div className="border p-2">{label}</div>
      <Handle type="source" position={Position.Right} id="value" />
      {/* <Handle className="!top-3" type="target" position={Position.Left} id="stop" /> */}
      {/* <Handle className="!top-7" type="target" position={Position.Right} id="start" /> */}
    </>
  );
};

export default SequenceBlock;
