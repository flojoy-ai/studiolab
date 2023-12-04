import SliderControl from '@/components/blocks/control/SliderControl';
import BigNumberDisplay from '@/components/blocks/control/BigNumberDisplay';
import ProgressDisplay from '@/components/blocks/control/ProgressDisplay';

export const nodeTypes = {
  'flojoy.control.slider': SliderControl,
  'flojoy.visualization.big_num': BigNumberDisplay,
  'flojoy.visualization.progress_bar': ProgressDisplay
};
