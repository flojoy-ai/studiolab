import { Button } from '../ui/Button';
import { trpcClient } from '@/main';

const ControlControlsTopLeft = (): JSX.Element => {
  return (
    <div className="absolute z-50 flex gap-2 p-4">
      <Button onClick={async () => await trpcClient.spawnFlowWindow.mutate()}>
        Show Flowchart
      </Button>
    </div>
  );
};

export default ControlControlsTopLeft;
