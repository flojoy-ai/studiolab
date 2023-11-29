import SliderControl from '@/components/blocks/control/SliderControl';
import BigNumberDisplay from '@/components/blocks/control/BigNumberDisplay';
import ToggleControl from '@/components/blocks/control/ToggleControl';

export const nodeTypes = {
  'flojoy.control.slider': SliderControl,
  'flojoy.control.toggle': ToggleControl,
  'flojoy.visualization.bignum': BigNumberDisplay
};
