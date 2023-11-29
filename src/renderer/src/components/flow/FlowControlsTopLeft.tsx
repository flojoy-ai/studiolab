import { Button } from '../ui/Button';
import { trpcClient } from '@/main';

const FlowControlsTopLeft = (): JSX.Element => {
  return (
    <div className="absolute z-50 flex gap-2 p-4">
      <Button onClick={async () => await trpcClient.spawnBlockLibraryWindow.mutate()}>
        Add Blocks
      </Button>
    </div>
  );
};

export default FlowControlsTopLeft;
