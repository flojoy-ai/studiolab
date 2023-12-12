import { NodeProps } from 'reactflow';

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
  | 'flojoy.visualization.bignum'
  | 'flojoy.intrinsics.function';

export type IntrinsicParameterValue = number | string;

type Name = string;
type FlojoyType = 'str' | 'int' | 'bool';

export type BlockData = {
  block_type: BlockType;
  label: string;
  intrinsic_parameters: Record<string, IntrinsicParameterValue>;
  inputs: Record<Name, FlojoyType>;
  outputs: Record<Name, FlojoyType>;
};

export type BlockProps = NodeProps<BlockData>;
