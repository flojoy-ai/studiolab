import BlockCard from '@/components/flow/BlockCard';
import 'reactflow/dist/style.css';

import { useShallow } from 'zustand/react/shallow';
import { useFlowchartStore } from '@/stores/flowchart';
const BlockLibrary = () => {
  const { addNode } = useFlowchartStore(
    useShallow((state) => ({
      addNode: state.addNode
    }))
  );

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
