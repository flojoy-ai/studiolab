import { Button } from '../ui/Button';

const FlowControlsTopLeft = (): JSX.Element => {
  return (
    <div className="absolute z-50 flex gap-2 p-4">
      <Button>Add Blocks</Button>
    </div>
  );
};

export default FlowControlsTopLeft;
