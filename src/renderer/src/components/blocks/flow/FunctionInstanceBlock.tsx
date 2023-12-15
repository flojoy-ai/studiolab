import { useFlowchartStore } from '@/stores/flowchart';
import { BlockProps } from '@/types/block';
import { Handle, Position } from 'reactflow';

const FunctionInstanceBlock = ({ data }: BlockProps) => {
  const functionDefinitionBlocks = useFlowchartStore((state) => state.functionDefinitionBlocks);
  const definitionBlock = functionDefinitionBlocks[data.label];

  const ins = Object.entries(definitionBlock.data.inputs);
  const outs = Object.entries(definitionBlock.data.outputs);

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
