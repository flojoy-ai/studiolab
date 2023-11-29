import { Button } from '../ui/Button';

import { useFlowchartStore } from '@/stores/flowchart';
import { useShallow } from 'zustand/react/shallow';
import ClearCanvasButton from './ClearCanvasButton';
import { useLifecycleStore } from '@/stores/lifecycle';
import { trpcClient } from '@/main';

const FlowControlsTopRight = (): JSX.Element => {
  const { edges, nodes } = useFlowchartStore(
    useShallow((state) => ({
      edges: state.edges,
      nodes: state.nodes
    }))
  );

  const { running, setRunning } = useLifecycleStore(
    useShallow((state) => ({
      running: state.running,
      setRunning: state.setRunning
    }))
  );

  const onCancel = async () => {
    await trpcClient.cancelFlowchart.mutate();
    setRunning(false);
  };

  const onStart = async () => {
    await trpcClient.startFlowchart.mutate(
      JSON.stringify({
        event: {
          event_type: 'start',
          rf: { nodes, edges }
        }
      })
    );
    setRunning(true);
  };

  return (
    <div className="absolute right-0 z-50 flex gap-2 p-4">
      {!running ? (
        <Button onClick={onStart}>Run</Button>
      ) : (
        <Button onClick={onCancel} variant="destructive">
          Interrupt
        </Button>
      )}
      <ClearCanvasButton />
    </div>
  );
};

export default FlowControlsTopRight;
