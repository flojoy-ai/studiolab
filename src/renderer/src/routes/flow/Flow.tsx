import BlockCard from '@/components/flow/BlockCard';
import FlowControlsTopLeft from '@/components/flow/FlowControlsTopLeft';
import FlowControlsTopRight from '@/components/flow/FlowControlsTopRight';
import { UIState, useUIStateStore } from '@/stores/ui';
import { cn } from '@/utils/style';
import SmartBezierEdge from '@tisoap/react-flow-smart-edge';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import { useShallow } from 'zustand/react/shallow';

const Flow = (): JSX.Element => {
  const edges = [{ id: '1-2', source: '1', target: '2' }];

  const nodes = [
    {
      id: '1',
      data: { label: 'Hello' },
      position: { x: 0, y: 0 },
      type: 'input'
    },
    {
      id: '2',
      data: { label: 'World' },
      position: { x: 100, y: 100 }
    }
  ];

  // You can give any name to your edge types
  // https://reactflow.dev/docs/api/edges/custom-edges/
  const edgeTypes = {
    smart: SmartBezierEdge
  };

  const { isBlocksLibraryActive } = useUIStateStore(
    useShallow((state: UIState) => ({
      isBlocksLibraryActive: state.isBlocksLibraryActive
    }))
  );

  return (
    <div className={'main-content flex  rounded-lg bg-muted p-4'}>
      <div
        className={cn('rounded-lg bg-background transition-all duration-100 ease-in-out', {
          'mr-4 w-96 delay-0': isBlocksLibraryActive,
          'w-0 delay-100': !isBlocksLibraryActive
        })}
      >
        <div
          className={cn('rounded-lg bg-background transition-all duration-100 ease-in-out', {
            'opacity-100 delay-100': isBlocksLibraryActive,
            'opacity-0 delay-0': !isBlocksLibraryActive
          })}
        >
          <div className="p-4 text-2xl font-bold">Blocks Library</div>
          <div className="flex flex-col gap-2 p-4">
            <BlockCard name="Add" desc="Add a bunch of stuff together" />
            <BlockCard name="Subtract" desc="Subtract a bunch of stuff together" />
            <BlockCard name="Debug" desc="Debugggg" />
          </div>
        </div>
      </div>
      <ReactFlow
        proOptions={{ hideAttribution: true }}
        nodes={nodes}
        edges={edges}
        edgeTypes={edgeTypes}
        className="rounded-lg bg-background"
      >
        <FlowControlsTopLeft />
        <FlowControlsTopRight />
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  );
};

export default Flow;
