import { Node, Edge } from 'reactflow';
import { BlockData } from './block';

export interface FlowStartEvent {
  event_type: 'start';
  rf: {
    nodes: Node<BlockData>[];
    edges: Edge[];
  };
}

export interface FlowCancelEvent {
  event_type: 'cancel';
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
  event: FlowStartEvent | FlowUIEvent | FlowCancelEvent;
}
