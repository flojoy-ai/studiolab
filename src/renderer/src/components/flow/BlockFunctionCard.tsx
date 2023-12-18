import { BlockAddPayload, BuiltinBlockData } from '@/types/block';
import { Button } from '../ui/Button';
import { DragEventHandler } from 'react';
import { Node } from 'reactflow';

type Props = {
  definitionBlock: Node<BuiltinBlockData>;
};

const BlockFunctionCard = ({ definitionBlock }: Props): JSX.Element => {
  const onDragStart: DragEventHandler<HTMLButtonElement> = (event) => {
    const payload: BlockAddPayload = {
      variant: 'function_instance',
      definition_block_id: definitionBlock.id
    };

    event.dataTransfer.setData('application/reactflow', JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'move';
    // TODO: We can set the custom drag image here to be how the
    // actual block is going to look like!
    event.dataTransfer.setDragImage(event.target as HTMLButtonElement, 0, 0);
  };
  console.log(definitionBlock);

  return (
    <Button variant="secondary" draggable onDragStart={onDragStart}>
      <div>{definitionBlock.data.label}</div>
    </Button>
  );
};

export default BlockFunctionCard;
