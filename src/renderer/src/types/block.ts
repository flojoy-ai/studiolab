import { Node, Edge, NodeProps } from 'reactflow';

// TODO: This should not be hardcoded
export type BlockType =
  | 'flojoy.control.toggle'
  | 'flojoy.control.slider'
  | 'flojoy.visualization.big_num'
  | 'flojoy.visualization.progress_bar'
  | 'flojoy.math.arithmetic.add'
  | 'flojoy.math.arithmetic.subtract'
  | 'flojoy.math.constant'
  | 'flojoy.math.rand'
  | 'flojoy.logic.sequence'
  | 'flojoy.logic.clock'
  | 'flojoy.logic.conditional'
  | 'flojoy.logic.true'
  | 'flojoy.logic.false'
  | 'flojoy.intrinsics.function';

export type IntrinsicParameterValue = number | string;

export type Name = string;
export type BlockID = string;
type FlojoyType = 'str' | 'int' | 'bool';

export type BuiltinBlockData = {
  block_type: BlockType;
  label: string;
  intrinsic_parameters: Record<string, IntrinsicParameterValue>;
  inputs: Record<Name, FlojoyType>;
  outputs: Record<Name, FlojoyType>;
};

export type BlockProps = NodeProps<BuiltinBlockData>;

type RegularBlockAddPayload = {
  variant: 'builtin';
  block_type: BlockType;
};

type FunctionBlockAddPayload = {
  variant: 'function_instance';
  definition_block_id: string;
};

export type BlockAddPayload = RegularBlockAddPayload | FunctionBlockAddPayload;

// A function is just a subflow, so we can define it using
// the parent function definition block and the child nodes and edges
export type FunctionDefinition = {
  block: Node<BuiltinBlockData>;
  nodes: Node<BlockData>[];
  edges: Edge[];
};

export type FunctionInstanceData = {
  block_type: 'function_instance';
  definition_block_id: string;
};

export type BlockData = BuiltinBlockData | FunctionInstanceData;
