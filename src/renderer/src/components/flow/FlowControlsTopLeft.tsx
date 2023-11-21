import { UIState, useUIStateStore } from '@/stores/ui';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '../ui/Button';
import useUndoRedo from '@/hooks/useUndoRedo';
import { Redo, Undo } from 'lucide-react';

const FlowControlsTopLeft = (): JSX.Element => {
  const { undo, redo } = useUndoRedo();
  const { isBlocksLibraryActive, setIsBlocksLibraryActive } = useUIStateStore(
    useShallow((state: UIState) => ({
      isBlocksLibraryActive: state.isBlocksLibraryActive,
      setIsBlocksLibraryActive: state.setIsBlocksLibraryActive
    }))
  );

  return (
    <div className="absolute z-50 flex gap-2 p-4">
      <Button size="icon" onClick={undo}>
        <Undo size="20" />
      </Button>
      <Button onClick={redo} size="icon">
        <Redo size="20" />
      </Button>
      {!isBlocksLibraryActive && (
        <Button
          onClick={(): void => {
            setIsBlocksLibraryActive(true);
          }}
        >
          Add Blocks
        </Button>
      )}
      <Button onClick={async () => await window.api.spawnBlocksLibraryWindow()}>New Window</Button>
    </div>
  );
};

export default FlowControlsTopLeft;
