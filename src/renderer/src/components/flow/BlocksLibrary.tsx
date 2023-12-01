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
        <BlockCard
          name="Add"
          desc="Add a bunch of stuff together"
          block_type="flojoy.math.arithmetic.add"
        />
        <BlockCard name="Slider" desc="it slides" block_type="flojoy.control.slider" />
        <BlockCard name="Toggle" desc="flipflop" block_type="flojoy.control.toggle" />
        <BlockCard name="Big Number" desc="Big number" block_type="flojoy.visualization.bignum" />
        <BlockCard name="Function Definition" desc="a -> b" block_type="flojoy.logic.function" />
        <BlockCard name="Sequence" desc="0..10" block_type="flojoy.logic.sequence" />
        <BlockCard name="Clock" desc="tick tock" block_type="flojoy.logic.clock" />
        <BlockCard name="Constant" desc="2" block_type="flojoy.math.constant" />
        <BlockCard name="Rand" desc="?" block_type="flojoy.math.rand" />
        <BlockCard
          name="Conditional"
          desc="if ... then ... else"
          block_type="flojoy.logic.conditional"
        />
        <BlockCard name="True" desc="trueing" block_type="flojoy.logic.true" />
        <BlockCard name="False" desc="no" block_type="flojoy.logic.false" />
      </div>
    </div>
  );
};

export default BlocksLibrary;
