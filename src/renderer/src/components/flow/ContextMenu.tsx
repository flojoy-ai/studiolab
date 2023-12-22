import { HTMLProps, PropsWithChildren } from 'react';
import { useReactFlow, useUpdateNodeInternals } from 'reactflow';
import { Button } from '../ui/Button';
import { useBlockUpdate, useFlowchartStore } from '@/stores/flowchart';
import { BlockData } from '@/types/block';
import { BookMarked, LucideIcon, Minus, Plus, X } from 'lucide-react';
import { cn } from '@/utils/style';

type ContextMenuItemProps = {
  onClick: () => void;
  className?: string;
  icon: LucideIcon;
};

export const ContextMenuItem = ({
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

type ContextMenuFunctionSectionProps = {
  id: string;
};

const ContextMenuFunctionSection = ({ id }: ContextMenuFunctionSectionProps) => {
  const updateBlock = useBlockUpdate(id);
  const updateNodeInternals = useUpdateNodeInternals();
  const { saveDefinition, functionDefinitionBlocks } = useFlowchartStore((state) => ({
    saveDefinition: state.saveDefinition,
    functionDefinitionBlocks: state.functionDefinitionBlocks
  }));

  const withAfterUpdate = (func: () => void) => {
    return () => {
      func();
      if (Object.values(functionDefinitionBlocks).find((b) => b.id === id)) {
        saveDefinition(id);
      }
      updateNodeInternals(id);
    };
  };

  const addFunctionParameter = () => {
    updateBlock((block) => {
      const numInputs = Object.keys(block.data.inputs).length;
      block.data.inputs[`in${numInputs}`] = 'int';
    });
  };

  const removeFunctionParameter = () => {
    updateBlock((block) => {
      const inputs = Object.entries(block.data.inputs).slice(0, -1);
      block.data.inputs = Object.fromEntries(inputs);
    });
  };

  const addFunctionOutput = () => {
    updateBlock((block) => {
      const numOutputs = Object.keys(block.data.outputs).length;
      block.data.outputs[`out${numOutputs}`] = 'int';
    });
  };

  const removeFunctionOutput = () => {
    updateBlock((block) => {
      const outputs = Object.entries(block.data.outputs).slice(0, -1);
      block.data.outputs = Object.fromEntries(outputs);
    });
  };

  return (
    <>
      <ContextMenuItem icon={BookMarked} onClick={() => saveDefinition(id)}>
        Save Definition
      </ContextMenuItem>
      <hr />
      <ContextMenuItem icon={Plus} onClick={withAfterUpdate(addFunctionParameter)}>
        Add Parameter
      </ContextMenuItem>
      <ContextMenuItem icon={Plus} onClick={withAfterUpdate(addFunctionOutput)}>
        Add Output
      </ContextMenuItem>
      <ContextMenuItem icon={Minus} onClick={withAfterUpdate(removeFunctionParameter)}>
        Remove Parameter
      </ContextMenuItem>
      <ContextMenuItem icon={Minus} onClick={withAfterUpdate(removeFunctionOutput)}>
        Remove Output
      </ContextMenuItem>
    </>
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
  const deleteNode = useFlowchartStore((state) => state.deleteNode);

  const { getNode } = useReactFlow<BlockData>();

  const node = getNode(id);
  if (!node) {
    throw new Error('impossible');
  }

  const isFunctionBlock = node.data.block_type == 'flojoy.intrinsics.function';

  return (
    <div
      style={{ top, left, right, bottom }}
      className="absolute z-50 flex flex-col border bg-background"
      {...props}
    >
      {isFunctionBlock && (
        <>
          <ContextMenuFunctionSection id={id} />
          <hr />
        </>
      )}
      <ContextMenuItem onClick={() => deleteNode(id)} icon={X}>
        Delete
      </ContextMenuItem>
    </div>
  );
};
