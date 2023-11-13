import BlockCard from '@/components/flow/BlockCard';
import { UIState, useUIStateStore } from '@/stores/ui';
import { cn } from '@/utils/style';
import 'reactflow/dist/style.css';

import { useShallow } from 'zustand/react/shallow';
import { useFlowchartStore } from '@/stores/flowchart';
const BlockLibrary = () => {
  const { addNode } = useFlowchartStore(
    useShallow((state) => ({
      addNode: state.addNode
    }))
  );

  const { isBlocksLibraryActive } = useUIStateStore(
    useShallow((state: UIState) => ({
      isBlocksLibraryActive: state.isBlocksLibraryActive
    }))
  );

  const handleAddSlider = addNode('slider');
  const handleAddAdd = addNode('add');
  const handleAddBigNumber = addNode('bignum');

  return (
    <div
      className={cn('rounded-lg bg-background transition-transform duration-100 ease-in-out', {
        'mr-4 w-96 delay-0': isBlocksLibraryActive,
        'w-0 delay-100': !isBlocksLibraryActive
      })}
    >
      <div
        className={cn('rounded-lg bg-background transition-transform duration-100 ease-in-out', {
          'opacity-100 delay-100': isBlocksLibraryActive,
          'opacity-0 delay-0': !isBlocksLibraryActive
        })}
      >
        <div className="p-4 text-2xl font-bold">Blocks Library</div>
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
