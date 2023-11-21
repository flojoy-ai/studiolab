import BlockCard from '@/components/flow/BlockCard';

const BlocksLibrary = () => {
  return (
    <div className="grow flex-col rounded-lg bg-background p-4">
      <div className="flex items-center">
        <div className="grow text-2xl font-bold">Blocks Library</div>
      </div>
      <div className="py-1"></div>
      <div className="text-sm">
        Add the block you need by <span className="font-bold">dragging</span> it to the flowchart on
        the right.
      </div>
      <div className="py-2"></div>
      <div className="flex flex-col gap-2">
        <BlockCard name="Add" desc="Add a bunch of stuff together" block_id="add" />
        <BlockCard name="Slider" desc="it slides" block_id="slider" />
        <BlockCard name="Big Number" desc="Big number" block_id="bignum" />
      </div>
    </div>
  );
};

export default BlocksLibrary;
