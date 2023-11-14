import { UIState, useUIStateStore } from '@/stores/ui';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '../ui/Button';
import useUndoRedo from '@/hooks/useUndoRedo';

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
      {!isBlocksLibraryActive && (
        <Button
          onClick={(): void => {
            setIsBlocksLibraryActive(true);
          }}
        >
          Add Blocks
        </Button>
      )}
      <Button onClick={undo}>Undo</Button>
      <Button onClick={redo}>Redo</Button>
    </div>
  );
};

export default FlowControlsTopLeft;
