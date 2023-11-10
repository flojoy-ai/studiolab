import BlockCard from '@/components/flow/BlockCard';
import { BlockData, BlockType } from '@/types/block';
import { UIState, useUIStateStore } from '@/stores/ui';
import { cn } from '@/utils/style';
import { useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

import { useShallow } from 'zustand/react/shallow';
const BlockLibrary = () => {
  const [nodes, setNodes] = useNodesState<BlockData>([]);
  const { isBlocksLibraryActive } = useUIStateStore(
    useShallow((state: UIState) => ({
      isBlocksLibraryActive: state.isBlocksLibraryActive
    }))
  );

  const addNode = (block_type: BlockType) => {
    return () => {
      setNodes(
        nodes.concat([
          {
            id: `${block_type}-${uuidv4()}`,
            position: { x: Math.random() * 30 - 15, y: Math.random() * 30 - 15 },
            type: block_type,
            data: {
              label: block_type,
              block_type
            }
          }
        ])
      );
    };
  };

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
