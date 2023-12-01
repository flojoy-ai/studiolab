import { NodeProps } from 'reactflow';

// TODO: This should not be hardcoded
export type BlockType =
  | 'flojoy.control.slider'
  | 'flojoy.visualization.bignum'
  | 'flojoy.math.arithmetic.add'
  | 'flojoy.math.arithmetic.subtract'
  | 'flojoy.math.constant';

export type IntrinsicParameterValue = number | string

export type BlockData = {
  block_type: BlockType;
  label: string;
  intrinsic_parameters: Record<string, IntrinsicParameterValue>;
};

export type BlockProps = NodeProps<BlockData>;
