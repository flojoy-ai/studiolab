import { BlockProps } from '@/types/block';
import { Handle, Position, HandleProps } from 'reactflow';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

type BlockInputOutputProps = {
  name: string;
  pythonType: string;
} & HandleProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, 'id'>;

const BlockInputOutput = ({ pythonType, name, ...props }: BlockInputOutputProps) => {
  return (
    <TooltipProvider key={name}>
      <Tooltip>
        <TooltipTrigger>
          <Handle {...props} />
        </TooltipTrigger>
        <TooltipContent className="cursor-crosshair">
          <code>
            {name}: {pythonType}
          </code>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const DefaultBlock = ({ data }: BlockProps) => {
  return (
    <div className="flex justify-center">
      <div className="flex translate-x-1.5 translate-y-1 flex-col justify-evenly">
        {Object.entries(data.inputs).map(([input, inputType]) => (
          <BlockInputOutput
            key={input}
            name={input}
            pythonType={inputType}
            className="!static"
            type="target"
            position={Position.Left}
          />
        ))}
      </div>
      <div className="border p-4">{data.label}</div>
      <div className="flex -translate-x-1.5 translate-y-1 flex-col justify-evenly">
        {Object.entries(data.outputs).map(([output, outputType]) => (
          <BlockInputOutput
            key={output}
            name={output}
            pythonType={outputType}
            className="!static"
            type="source"
            position={Position.Right}
          />
        ))}
      </div>
    </div>
  );
};
