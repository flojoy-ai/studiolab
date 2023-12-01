import AddBlock from '@/components/blocks/flow/AddBlock';
import BigNumberBlock from '@/components/blocks/flow/BigNumberBlock';
import SliderBlock from '@/components/blocks/flow/SliderBlock';
import FunctionBlock from '@/components/blocks/flow/FunctionBlock';
import SequenceBlock from '@/components/blocks/flow/SequenceBlock';
import ConstantBlock from '@/components/blocks/flow/ConstantBlock';
import ConditionalBlock from '@/components/blocks/flow/ConditionalBlock';
import TrueBlock from '@/components/blocks/flow/TrueBlock';
import FalseBlock from '@/components/blocks/flow/FalseBlock';
import RandBlock from '@/components/blocks/flow/RandBlock';
import ToggleBlock from '@/components/blocks/flow/ToggleBlock';
import ClockBlock from '@/components/blocks/flow/ClockBlock';

export const nodeTypes = {
  'flojoy.control.slider': SliderBlock,
  'flojoy.control.toggle': ToggleBlock,
  'flojoy.visualization.bignum': BigNumberBlock,
  'flojoy.math.arithmetic.add': AddBlock,
  'flojoy.math.constant': ConstantBlock,
  'flojoy.math.rand': RandBlock,
  'flojoy.logic.conditional': ConditionalBlock,
  'flojoy.logic.function': FunctionBlock,
  'flojoy.logic.sequence': SequenceBlock,
  'flojoy.logic.clock': ClockBlock,
  'flojoy.logic.true': TrueBlock,
  'flojoy.logic.false': FalseBlock
};
