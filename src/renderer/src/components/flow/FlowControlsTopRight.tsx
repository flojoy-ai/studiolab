import { Button } from '../ui/Button';

const FlowControlsTopLeft = (): JSX.Element => {
  return (
    <div className="absolute right-0 z-50 flex gap-2 p-4">
      <Button variant="destructive">Clear Canvas</Button>
    </div>
  );
};

export default FlowControlsTopLeft;
