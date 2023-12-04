import SliderControl from '@/components/blocks/control/SliderControl';
import BigNumberDisplay from '@/components/blocks/control/BigNumberDisplay';
import ToggleControl from '@/components/blocks/control/ToggleControl';
import ProgressDisplay from '@/components/blocks/control/ProgressDisplay';

export const nodeTypes = {
  'flojoy.control.slider': SliderControl,
  'flojoy.control.toggle': ToggleControl,
  'flojoy.visualization.big_num': BigNumberDisplay,
  'flojoy.visualization.progress_bar': ProgressDisplay
};
