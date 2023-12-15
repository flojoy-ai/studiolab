import BlockCard from '@/components/flow/BlockCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/Tabs';
import { useFlowchartStore } from '@/stores/flowchart';
import BlockFunctionCard from './BlockFunctionCard';
import { X } from 'lucide-react';

const BlocksLibrary = () => {
  const { functionDefinitions, removeDefinition } = useFlowchartStore((state) => ({
    functionDefinitions: state.functionDefinitionBlocks,
    removeDefinition: state.removeDefinition
  }));

  return (
    <div className="grow flex-col rounded-lg bg-background p-4">
      <div className="flex items-center">
        <div className="grow text-2xl font-bold">Blocks Library</div>
      </div>
      <div className="py-1"></div>
      <div className="text-sm">
        Add the block you need by <span className="font-bold">dragging</span> it to the flowchart on
        the right.
      </div>{' '}
      <div className="py-2"></div>
      <Tabs defaultValue="stdlib">
        <TabsList>
          <TabsTrigger value="stdlib">Standard Library</TabsTrigger>
          <TabsTrigger value="functions">Custom Functions</TabsTrigger>
        </TabsList>
        <TabsContent value="stdlib">
          <div className="flex flex-col gap-2">
            {/* TODO: This should be auto generated */}
            <BlockCard
              name="Add"
              desc="Add a bunch of stuff together"
              block_type="flojoy.math.arithmetic.add"
            />
            <BlockCard name="Slider" desc="it slides" block_type="flojoy.control.slider" />
            <BlockCard name="Toggle" desc="flipflop" block_type="flojoy.control.toggle" />
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
            <BlockCard
              name="Big Number"
              desc="Big number"
              block_type="flojoy.visualization.big_num"
            />
            <BlockCard
              name="Progress Bar"
              desc="progress bar"
              block_type="flojoy.visualization.progress_bar"
            />
            <BlockCard
              name="Function Definition"
              desc="a -> b"
              block_type="flojoy.intrinsics.function"
            />
          </div>
        </TabsContent>
        <TabsContent value="functions">
          <div className="text-sm">
            Custom functions are listed here. Try defining one using the &quot;Function
            definition&quot; block.
          </div>
          {Object.keys(functionDefinitions).map((functionName) => (
            <div key={functionName} className="flex items-center gap-2">
              <BlockFunctionCard name={functionName} />
              <X
                className="cursor-pointer duration-200 hover:text-muted-foreground"
                size={20}
                onClick={() => removeDefinition(functionName)}
              />
            </div>
          ))}
        </TabsContent>
      </Tabs>
      <div className="py-6"></div>
    </div>
  );
};

export default BlocksLibrary;
