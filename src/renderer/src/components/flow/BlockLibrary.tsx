import BlockCard from '@/components/flow/BlockCard';
import 'reactflow/dist/style.css';

import { useShallow } from 'zustand/react/shallow';
import { useUIStateStore } from '@/stores/ui';
import { cn } from '@/utils/style';
import { XCircle } from 'lucide-react';
import { Button } from '../ui/Button';

const BlockLibrary = () => {
  const { isBlocksLibraryActive, setIsBlocksLibraryActive } = useUIStateStore(
    useShallow((state) => ({
      isBlocksLibraryActive: state.isBlocksLibraryActive,
      setIsBlocksLibraryActive: state.setIsBlocksLibraryActive
    }))
  );

  return (
    <div
      className={cn('flex', {
        'w-96': isBlocksLibraryActive,
        'w-0': !isBlocksLibraryActive
      })}
    >
      <div className="px-2"></div>
      <div className="grow flex-col rounded-lg bg-background p-4">
        <div className="flex items-center">
          <div className="grow text-2xl font-bold">Blocks Library</div>
          <Button size="icon" variant="ghost" onClick={() => setIsBlocksLibraryActive(false)}>
            <XCircle />
          </Button>
        </div>
        <div className="text-sm">
          Add the block you need by <span className="font-bold">dragging</span> it to the flowchart
          on the right.
        </div>
        <div className="py-2"></div>
        <div className="flex flex-col gap-2">
          <BlockCard name="Add" desc="Add a bunch of stuff together" block_id="add" />
          <BlockCard name="Slider" desc="it slides" block_id="slider" />
          <BlockCard name="Big Number" desc="Big number" block_id="bignum" />
        </div>
      </div>
    </div>
  );
};

export default BlockLibrary;
