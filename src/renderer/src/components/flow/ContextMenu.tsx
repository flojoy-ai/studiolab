import { HTMLProps, PropsWithChildren } from 'react';
import { useReactFlow, useUpdateNodeInternals } from 'reactflow';
import { Button } from '../ui/Button';
import { useFlowchartStore } from '@/stores/flowchart';
import { BlockData } from '@/types/block';
import { LucideIcon, Minus, Plus, X } from 'lucide-react';
import { cn } from '@/utils/style';

type ContextMenuItemProps = {
  onClick: () => void;
  className?: string;
  icon: LucideIcon;
};

const ContextMenuItem = ({
  onClick,
  className,
  icon,
  children
}: PropsWithChildren<ContextMenuItemProps>) => {
  const Icon = icon;

  return (
    <Button
      className={cn('flex w-full justify-start gap-2', className)}
      variant="ghost"
      size="sm"
      onClick={onClick}
    >
      <Icon size={14} />
      {children}
    </Button>
  );
};

export type ContextMenuProps = {
  id: string;
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
};

export const ContextMenu = ({
  id,
  top,
  left,
  right,
  bottom,
  ...props
}: ContextMenuProps & HTMLProps<HTMLDivElement>) => {
  const { deleteNode, updateBlock } = useFlowchartStore((state) => ({
    deleteNode: state.deleteNode,
    updateBlock: state.updateBlock
  }));

  const { getNode } = useReactFlow<BlockData>();
  const updateNodeInternals = useUpdateNodeInternals();

  const node = getNode(id);
  if (!node) {
    throw new Error('impossible');
  }

  const isFunctionBlock = node.data.block_type == 'flojoy.intrinsics.function';
  const addFunctionParameter = () => {
    updateBlock(id, (block) => {
      const numInputs = Object.keys(block.data.inputs).length;
      block.data.inputs[`In${numInputs}`] = 'int';
      updateNodeInternals(id);
    });
  };

  const removeFunctionParameter = () => {
    updateBlock(id, (block) => {
      const inputs = Object.entries(block.data.inputs).slice(0, -1);
      block.data.inputs = Object.fromEntries(inputs);
      updateNodeInternals(id);
    });
  };

  const addFunctionOutput = () => {
    updateBlock(id, (block) => {
      const numOutputs = Object.keys(block.data.outputs).length;
      block.data.outputs[`Out${numOutputs}`] = 'int';
      updateNodeInternals(id);
    });
  };

  const removeFunctionOutput = () => {
    updateBlock(id, (block) => {
      const outputs = Object.entries(block.data.outputs).slice(0, -1);
      block.data.outputs = Object.fromEntries(outputs);
      updateNodeInternals(id);
    });
  };

  return (
    <div
      style={{ top, left, right, bottom }}
      className="absolute z-50 flex flex-col border bg-background"
      {...props}
    >
      {isFunctionBlock && (
        <>
          <ContextMenuItem icon={Plus} onClick={addFunctionParameter}>
            Add Parameter
          </ContextMenuItem>
          <ContextMenuItem icon={Plus} onClick={addFunctionOutput}>
            Add Output
          </ContextMenuItem>
          <ContextMenuItem icon={Minus} onClick={removeFunctionParameter}>
            Remove Parameter
          </ContextMenuItem>
          <ContextMenuItem icon={Minus} onClick={removeFunctionOutput}>
            Remove Output
          </ContextMenuItem>
        </>
      )}
      <ContextMenuItem onClick={() => deleteNode(id)} icon={X}>
        Delete
      </ContextMenuItem>
    </div>
  );
};
