import { BlockAddPayload, BlockType } from '@/types/block';
import { Button } from '../ui/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';
import { DragEventHandler } from 'react';

type Props = {
  name: string;
  block_type: BlockType;
  desc: string;
};

const BlockCard = ({ name, desc, block_type }: Props): JSX.Element => {
  const onDragStart: DragEventHandler<HTMLButtonElement> = (event) => {
    const payload: BlockAddPayload = {
      variant: 'builtin',
      block_type
    };

    event.dataTransfer.setData('application/reactflow', JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'move';
    // TODO: We can set the custom drag image here to be how the
    // actual block is going to look like!
    event.dataTransfer.setDragImage(event.target as HTMLButtonElement, 0, 0);
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="secondary" draggable onDragStart={onDragStart}>
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
