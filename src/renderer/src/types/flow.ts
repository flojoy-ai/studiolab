import { Node, Edge } from 'reactflow';
import { BlockData } from './block';

export interface BlockConnection {
  source: string;
  target: string;
  sourceParam: string;
  targetParam: string;
}

export interface FCBlock {
  id: string;
  block_type: 'slider' | 'gamepad' | 'button' | 'bignum' | 'add' | 'subtract';
  ins: BlockConnection[];
  outs: BlockConnection[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state?: any;
}

export interface FlowChart {
  blocks: FCBlock[];
}

export interface FlowStartEvent {
  event_type: 'start';
  rf: {
    nodes: Node<BlockData>[];
    edges: Edge[];
  };
}

export interface FlowUIEvent {
  event_type: 'ui';
  ui_input_id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any;
}

export interface FlowStateUpdateEvent {
  event_type: 'state_update';
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface FlowSocketMessage {
  event: FlowStartEvent | FlowUIEvent;
}
