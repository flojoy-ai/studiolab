import AddBlock from '@/components/blocks/flow/AddBlock';
import BigNumberBlock from '@/components/blocks/flow/BigNumberBlock';
import SliderBlock from '@/components/blocks/flow/SliderBlock';

export const nodeTypes = {
  'flojoy.control.slider': SliderBlock,
  'flojoy.visualization.bignum': BigNumberBlock,
  'flojoy.math.arithmetic.add': AddBlock
};
