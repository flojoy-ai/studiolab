import { UIState, useUIStateStore } from '@/stores/ui';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '../ui/Button';

const FlowControlsTopLeft = (): JSX.Element => {
  const { isBlocksLibraryActive, setIsBlocksLibraryActive } = useUIStateStore(
    useShallow((state: UIState) => ({
      isBlocksLibraryActive: state.isBlocksLibraryActive,
      setIsBlocksLibraryActive: state.setIsBlocksLibraryActive
    }))
  );
  return (
    <div className="absolute z-50 flex gap-2 p-4">
      <Button
        onClick={(): void => {
          setIsBlocksLibraryActive(!isBlocksLibraryActive);
        }}
      >
        Add Blocks
      </Button>
    </div>
  );
};

export default FlowControlsTopLeft;
