import BlockCard from '@/components/flow/BlockCard';
import { BlockData, BlockType } from '@/types/block';
import { useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

const BlockLibrary = () => {
  const [nodes, setNodes] = useNodesState<BlockData>([]);

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
    <div className="h-full bg-background">
      <div className="p-4 text-2xl font-bold">Blocks Library</div>
      <div className="flex flex-col gap-2 p-4">
        <BlockCard name="Add" desc="Add a bunch of stuff together" onClick={handleAddAdd} />
        <BlockCard name="Slider" desc="it slides" onClick={handleAddSlider} />
        <BlockCard name="Big Number" desc="Big number" onClick={handleAddBigNumber} />
      </div>
    </div>
  );
};

export default BlockLibrary;
