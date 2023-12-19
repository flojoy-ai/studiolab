import { Handle, Position } from 'reactflow';
import { BlockProps } from '@/types/block';
import { Input } from '@/components/ui/Input';
import { useBlockUpdate, useFlowchartStore } from '@/stores/flowchart';

const FunctionDefinitionBlock = ({ id, data }: BlockProps) => {
  const ins = Object.entries(data.inputs);
  const outs = Object.entries(data.outputs);

  const updateBlock = useBlockUpdate(id);

  const { saveDefinition, functionDefinitions } = useFlowchartStore((state) => ({
    saveDefinition: state.saveDefinition,
    functionDefinitions: state.functionDefinitionBlocks
  }));

  return (
    <>
      <div className="relative h-64 w-[512px] border">
        <Input
          className="mx-auto w-fit"
          value={data.label}
          onBlur={() => {
            if (id in functionDefinitions && data.label !== functionDefinitions[id].data.label) {
              saveDefinition(id);
            }
          }}
          onChange={(e) =>
            updateBlock((block) => {
              block.data.label = e.target.value;
            })
          }
        />
        <div className="absolute left-2 top-1/2 flex -translate-y-1/2 flex-col gap-2">
          {ins.map(([name]) => (
            <div key={`input-block-${name}`} className="relative border px-4 py-3">
              <div>{name}</div>
              <Handle type="source" position={Position.Right} id={`FUNC-INTERNAL_${name}`} />
            </div>
          ))}
        </div>
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 flex-col gap-2">
          {outs.map(([name]) => (
            <div key={`output-block-${name}`} className="relative border px-4 py-3">
              <div>{name}</div>
              <Handle type="target" position={Position.Left} id={`FUNC-INTERNAL_${name}`} />
            </div>
          ))}
        </div>
        {ins.map(([name], i) => (
          <Handle
            key={`input-handle-${name}`}
            type="target"
            position={Position.Left}
            style={{ top: i * 20 }}
            id={name}
          />
        ))}
        {outs.map(([name], i) => (
          <Handle
            key={`output-handle-${name}`}
            type="source"
            position={Position.Right}
            style={{ top: i * 20 }}
            id={name}
          />
        ))}
      </div>
    </>
  );
};

export default FunctionDefinitionBlock;
