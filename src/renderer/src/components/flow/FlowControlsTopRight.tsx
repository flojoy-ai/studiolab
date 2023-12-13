import { Button } from '../ui/Button';

import { useFlowchartStore } from '@/stores/flowchart';
import { useShallow } from 'zustand/react/shallow';
import { useLifecycleStore } from '@/stores/lifecycle';
import { trpcClient } from '@/main';

const FlowControlsTopRight = (): JSX.Element => {
  const { edges, nodes, functionDefinitions } = useFlowchartStore(
    useShallow((state) => ({
      edges: state.edges,
      nodes: state.nodes,
      functionDefinitions: state.functionDefinitions
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
