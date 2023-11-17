import BlockCard from '@/components/flow/BlockCard';
import 'reactflow/dist/style.css';

import { useShallow } from 'zustand/react/shallow';
import { useFlowchartStore } from '@/stores/flowchart';
import { useUIStateStore } from '@/stores/ui';
import { cn } from '@/utils/style';
import { XCircle } from 'lucide-react';
import { Button } from '../ui/Button';

const BlockLibrary = () => {
  const { addNode } = useFlowchartStore(
    useShallow((state) => ({
      addNode: state.addNode
    }))
  );

  const { isBlocksLibraryActive, setIsBlocksLibraryActive } = useUIStateStore((state) => ({
    isBlocksLibraryActive: state.isBlocksLibraryActive,
    setIsBlocksLibraryActive: state.setIsBlocksLibraryActive
  }));

  const handleAddSlider = addNode('slider');
  const handleAddAdd = addNode('add');
  const handleAddBigNumber = addNode('bignum');

  return (
    <div
      className={cn('flex', {
        'w-96': isBlocksLibraryActive,
        'w-0': !isBlocksLibraryActive
      })}
    >
      <div className="px-2"></div>
      <div className="grow flex-col rounded-lg bg-background">
        <div className="flex items-center p-4">
          <div className="grow text-2xl font-bold">Blocks Library</div>
          <Button size="icon" variant="ghost" onClick={() => setIsBlocksLibraryActive(false)}>
            <XCircle />
          </Button>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <BlockCard name="Add" desc="Add a bunch of stuff together" onClick={handleAddAdd} />
          <BlockCard name="Slider" desc="it slides" onClick={handleAddSlider} />
          <BlockCard name="Big Number" desc="Big number" onClick={handleAddBigNumber} />
        </div>
      </div>
    </div>
  );
};

export default BlockLibrary;
