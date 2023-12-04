import { NodeProps } from 'reactflow';

// TODO: This should not be hardcoded
export type BlockType =
  | 'flojoy.control.slider'
  | 'flojoy.control.progress_bar'
  | 'flojoy.visualization.big_num'
  | 'flojoy.math.arithmetic.add'
  | 'flojoy.math.arithmetic.subtract'
  | 'flojoy.math.constant';

export type BlockData = {
  block_type: BlockType;
  label: string;
};

export type BlockProps = NodeProps<BlockData>;
