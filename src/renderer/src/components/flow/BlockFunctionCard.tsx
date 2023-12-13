import { BlockAddPayload } from '@/types/block';
import { Button } from '../ui/Button';
import { DragEventHandler } from 'react';

type Props = {
  name: string;
};

const BlockFunctionCard = ({ name }: Props): JSX.Element => {
  const onDragStart: DragEventHandler<HTMLButtonElement> = (event) => {
    const payload: BlockAddPayload = {
      variant: 'function_instance',
      name
    };

    event.dataTransfer.setData('application/reactflow', JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'move';
    // TODO: We can set the custom drag image here to be how the
    // actual block is going to look like!
    event.dataTransfer.setDragImage(event.target as HTMLButtonElement, 0, 0);
  };

  return (
    <Button variant="secondary" draggable onDragStart={onDragStart}>
      <div>{name}</div>
    </Button>
  );
};

export default BlockFunctionCard;
