import { Button } from '../ui/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';

type Props = {
  name: string;
  block_id: string;
  desc: string;
};

const BlockCard = ({ name, desc, block_id }: Props): JSX.Element => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    // TODO: We can set the custom drag image here to be how the
    // actual block is going to look like!
    event.dataTransfer.setDragImage(event.target, 0, 0);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className=""
            variant="secondary"
            draggable
            onDragStart={(event) => onDragStart(event, block_id)}
          >
            <div>{name}</div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div>{desc}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BlockCard;
