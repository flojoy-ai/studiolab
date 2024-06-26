import { useFlowchartStore } from '@/stores/flowchart';
import { FunctionInstanceData } from '@/types/block';
import { Handle, NodeProps, Position, useUpdateNodeInternals } from 'reactflow';

// TODO: Figure out what to do with instance blocks when the original definition is removed
const FunctionInstanceBlock = ({ id, data }: NodeProps<FunctionInstanceData>) => {
  const functionDefinitionBlocks = useFlowchartStore((state) => state.functionDefinitionBlocks);
  const defn = functionDefinitionBlocks[data.definition_block_id];

  const ins = Object.entries(defn.data.inputs);
  const outs = Object.entries(defn.data.outputs);

  const updateNodeInternals = useUpdateNodeInternals();

  updateNodeInternals(id);

  return (
    <>
      <div className="border p-4">{defn.data.label}</div>
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
