import AddBlock from '@/components/blocks/flow/AddBlock';
import BigNumberBlock from '@/components/blocks/flow/BigNumberBlock';
import ProgressBlock from '@/components/blocks/flow/ProgressBlock';
import SliderBlock from '@/components/blocks/flow/SliderBlock';
import SequenceBlock from '@/components/blocks/flow/SequenceBlock';
import ConstantBlock from '@/components/blocks/flow/ConstantBlock';
import ConditionalBlock from '@/components/blocks/flow/ConditionalBlock';
import TrueBlock from '@/components/blocks/flow/TrueBlock';
import FalseBlock from '@/components/blocks/flow/FalseBlock';
import RandBlock from '@/components/blocks/flow/RandBlock';
import ToggleBlock from '@/components/blocks/flow/ToggleBlock';
import ClockBlock from '@/components/blocks/flow/ClockBlock';
import FunctionDefinitionBlock from '@/components/blocks/flow/FunctionDefinitionBlock';
import FunctionInstanceBlock from '@/components/blocks/flow/FunctionInstanceBlock';
import FibsBlock from '@/components/blocks/flow/FibsBlock';

export const nodeTypes = {
  'flojoy.control.slider': SliderBlock,
  'flojoy.control.toggle': ToggleBlock,
  'flojoy.math.arithmetic.add': AddBlock,
  'flojoy.math.constant': ConstantBlock,
  'flojoy.math.rand': RandBlock,
  'flojoy.math.fibs': FibsBlock,
  'flojoy.logic.conditional': ConditionalBlock,
  'flojoy.logic.sequence': SequenceBlock,
  'flojoy.logic.clock': ClockBlock,
  'flojoy.logic.true': TrueBlock,
  'flojoy.logic.false': FalseBlock,
  'flojoy.visualization.big_num': BigNumberBlock,
  'flojoy.visualization.progress_bar': ProgressBlock,
  'flojoy.intrinsics.function': FunctionDefinitionBlock,
  function_instance: FunctionInstanceBlock
};
