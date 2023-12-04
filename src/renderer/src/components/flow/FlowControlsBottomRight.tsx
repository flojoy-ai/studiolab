import ClearCanvasButton from './ClearCanvasButton';

import useUndoRedo from '@/hooks/useUndoRedo';
import { Redo, Undo } from 'lucide-react';
import { Button } from '../ui/Button';
const FlowControlsBottomRight = (): JSX.Element => {
  const { undo, redo } = useUndoRedo();
  return (
    <div className="absolute bottom-0 right-0 z-50 flex gap-2 p-4">
      <Button size="icon" onClick={undo}>
        <Undo size="20" />
      </Button>
      <Button onClick={redo} size="icon">
        <Redo size="20" />
      </Button>
      <ClearCanvasButton />
    </div>
  );
};

export default FlowControlsBottomRight;
