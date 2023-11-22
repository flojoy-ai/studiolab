import { Button } from '../ui/Button';
import useUndoRedo from '@/hooks/useUndoRedo';
import { trpcClient } from '@/main';
import { Redo, Undo } from 'lucide-react';

const FlowControlsTopLeft = (): JSX.Element => {
  const { undo, redo } = useUndoRedo();

  return (
    <div className="absolute z-50 flex gap-2 p-4">
      <Button size="icon" onClick={undo}>
        <Undo size="20" />
      </Button>
      <Button onClick={redo} size="icon">
        <Redo size="20" />
      </Button>
      <Button onClick={async () => await trpcClient.spawnBlockLibraryWindow.query()}>
        Add Blocks
      </Button>
    </div>
  );
};

export default FlowControlsTopLeft;
