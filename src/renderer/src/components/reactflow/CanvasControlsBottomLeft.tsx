import { useReactFlow } from 'reactflow';
import { Button } from '../ui/Button';
import { Fullscreen, ZoomIn, ZoomOut } from 'lucide-react';

const CanvasControlsBottomLeft = () => {
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  return (
    <div className="absolute bottom-0 left-0 z-50 flex gap-2 p-4">
      <Button size="icon" onClick={() => zoomIn()}>
        <ZoomIn />
      </Button>
      <Button onClick={() => zoomOut()} size="icon">
        <ZoomOut />
      </Button>
      <Button onClick={() => fitView()} size="icon">
        <Fullscreen />
      </Button>
    </div>
  );
};

export default CanvasControlsBottomLeft;
