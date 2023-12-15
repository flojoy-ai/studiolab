import { Button } from '../ui/Button';

import { useFlowchartStore } from '@/stores/flowchart';
import { useShallow } from 'zustand/react/shallow';
import { useLifecycleStore } from '@/stores/lifecycle';
import { trpcClient } from '@/main';
import { FunctionDefinition, Name } from '@/types/block';

const FlowControlsTopRight = (): JSX.Element => {
  const { edges, nodes, functionDefinitionBlocks } = useFlowchartStore(
    useShallow((state) => ({
      edges: state.edges,
      nodes: state.nodes,
      functionDefinitionBlocks: state.functionDefinitionBlocks
    }))
  );

  const { flowRunning, setFlowRunning } = useLifecycleStore(
    useShallow((state) => ({
      flowRunning: state.flowRunning,
      setFlowRunning: state.setFlowRunning
    }))
  );

  const onCancel = async () => {
    await trpcClient.cancelFlowchart.mutate(
      JSON.stringify({
        event: {
          event_type: 'cancel'
        }
      })
    );
    setFlowRunning(false);
  };

  const onStart = async () => {
    const functionDefinitions: Record<Name, FunctionDefinition> = {};
    for (const [name, block] of Object.entries(functionDefinitionBlocks)) {
      const bodyNodes = nodes.filter((n) => n.parentNode === block.id);
      const bodyNodeIds = new Set(bodyNodes.map((n) => n.id));
      bodyNodeIds.add(block.id);
      const bodyEdges = edges.filter((e) => bodyNodeIds.has(e.target) && bodyNodeIds.has(e.source));

      functionDefinitions[name] = {
        block,
        nodes: bodyNodes,
        edges: bodyEdges
      };
    }

    await trpcClient.startFlowchart.mutate(
      JSON.stringify({
        event: {
          event_type: 'start',
          rf: { nodes, edges },
          function_definitions: functionDefinitions
        }
      })
    );
    setFlowRunning(true);
  };

  return (
    <div className="absolute right-0 z-50 flex gap-2 p-4">
      {!flowRunning ? (
        <Button onClick={onStart}>Run Flowchart</Button>
      ) : (
        <Button onClick={onCancel} variant="destructive">
          Interrupt
        </Button>
      )}
    </div>
  );
};

export default FlowControlsTopRight;
