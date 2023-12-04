import AddBlock from '@/components/blocks/flow/AddBlock';
import BigNumberBlock from '@/components/blocks/flow/BigNumberBlock';
import ProgressBlock from '@/components/blocks/flow/ProgressBlock';
import SliderBlock from '@/components/blocks/flow/SliderBlock';

export const nodeTypes = {
  'flojoy.control.slider': SliderBlock,
  'flojoy.visualization.big_num': BigNumberBlock,
  'flojoy.visualization.progress_bar': ProgressBlock,
  'flojoy.math.arithmetic.add': AddBlock
};
