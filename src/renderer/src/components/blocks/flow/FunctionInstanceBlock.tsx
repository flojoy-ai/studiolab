import { BlockProps } from '@/types/block';
import { Handle, Position } from 'reactflow';

const FunctionInstanceBlock = ({ data }: BlockProps) => {
  const ins = Object.entries(data.inputs);
  const outs = Object.entries(data.outputs);

  return (
    <>
      <div className="border p-4">{data.label}</div>
      {ins.map(([name], i) => (
        <Handle
          key={`input-handle-${name}`}
          type="target"
          position={Position.Left}
          style={{ top: i * 10 }}
          id={name}
        />
      ))}
      {outs.map(([name], i) => (
        <Handle
          key={`output-handle-${name}`}
          type="source"
          position={Position.Right}
          style={{ top: i * 10 }}
          id={name}
        />
      ))}
    </>
  );
};

export default FunctionInstanceBlock;
