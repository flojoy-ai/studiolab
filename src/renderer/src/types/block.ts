import { NodeProps } from 'reactflow';

export type BlockType = 'slider' | 'gamepad' | 'button' | 'bignum' | 'add' | 'subtract';

export type BlockData = {
  block_type: BlockType;
  label: string;
};

export type BlockProps = NodeProps<BlockData>;
