import { ChangeEvent, useEffect } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { Button } from './ui/Button';
import { Separator } from './ui/Separator';
import { Card } from './ui/Card';
import { ScrollArea } from './ui/ScrollArea';
import { useImmer } from 'use-immer';

const SOCKET_URL = 'ws://localhost:2333/blocks/flowchart';

interface BlockConnection {
  source: string;
  target: string;
  sourceParam: string;
  targetParam: string;
}
interface FCBlock {
  id: string;
  block_type: 'slider' | 'gamepad' | 'button' | 'bignum' | 'add' | 'subtract';
  ins: BlockConnection[];
  outs: BlockConnection[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state?: any;
}

interface FlowChart {
  blocks: FCBlock[];
}

interface FlowStartEvent {
  event_type: 'start';
  flowchart: FlowChart;
}

interface FlowUIEvent {
  event_type: 'ui';
  ui_input_id: string;
  value: string;
}

interface FlowStateUpdateEvent {
  event_type: 'state_update';
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

interface FlowSocketMessage {
  event: FlowStartEvent | FlowUIEvent;
}

type FlowBlockProps = {
  block: FCBlock;
};

const FlowBlock = ({ block }: FlowBlockProps) => {
  return (
    <Card>
      <h4>{block.id}</h4>
      <pre>
        <code>{block.state ?? 'Not run yet'}</code>
      </pre>
    </Card>
  );
};

type FlowSliderProps = FlowBlockProps & {
  sendSocketEvent: (message: FlowSocketMessage['event']) => void;
};

const FlowSlider = ({ block, sendSocketEvent }: FlowSliderProps) => {
  const handleSetSlider = (event: ChangeEvent<HTMLInputElement>): void => {
    sendSocketEvent({
      event_type: 'ui',
      ui_input_id: block.id,
      value: event.target.value
    });
  };

  return (
    <Card>
      <h4>{block.id}</h4>
      <input type="range" min="0" max="100" onChange={handleSetSlider} />
      <pre>
        <code>{block.state ?? 'Not run yet'}</code>
      </pre>
    </Card>
  );
};

export const FlowchartWS = () => {
  const [flowchart, setFlowchart] = useImmer<FlowChart | undefined>(undefined);
  const { sendMessage, lastMessage, readyState } = useWebSocket(SOCKET_URL);

  useEffect(() => {
    if (lastMessage !== null) {
      const jsonMsg = lastMessage.data.replace(/'/g, '"');
      console.log('GOT MESSAGE: ' + jsonMsg);
      const stateUpdate = JSON.parse(jsonMsg) as FlowStateUpdateEvent;

      setFlowchart((fc) => {
        if (fc === undefined) {
          return undefined;
        }
        const block = fc.blocks.find((b) => b.id === stateUpdate.id);
        if (!block) {
          throw new Error(`Could not find block '${stateUpdate.id}' to update state for`);
        }
        block.state = stateUpdate.data;
      });
    }
  }, [lastMessage, setFlowchart]);

  const sendSocketEvent = (message: FlowSocketMessage['event']): void => {
    sendMessage(JSON.stringify({ event: message }));
  };

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
  }[readyState];

  const handleStart = (): void => {
    if (connectionStatus === 'Open' && flowchart) {
      sendSocketEvent({
        event_type: 'start',
        flowchart
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (!event.target.files) {
      return;
    }

    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (event): void => {
      if (!event.target?.result) {
        throw new Error('Failed to read uploaded JSON file.');
      }
      const text = event.target.result.toString();
      setFlowchart(JSON.parse(text));
    };

    reader.readAsText(file, 'UTF-8');
  };

  return (
    <div>
      <ScrollArea>
        <span>The WebSocket is currently {connectionStatus}</span>
        {lastMessage ? <span> | Last message: {lastMessage.data}</span> : null}
        <Separator />
        <Button
          onClick={handleStart}
          disabled={readyState !== ReadyState.OPEN || flowchart === undefined}
        >
          Start Flowchart
        </Button>
        <input type="file" accept={'.json'} onChange={handleFileUpload}></input>
        <Separator />
        {flowchart !== undefined &&
          flowchart.blocks.map((block) =>
            block.block_type === 'slider' ? (
              <FlowSlider key={block.id} block={block} sendSocketEvent={sendSocketEvent} />
            ) : (
              <FlowBlock key={block.id} block={block} />
            )
          )}
      </ScrollArea>
    </div>
  );
};
