import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  XYPosition
} from 'reactflow';
import { BuiltinBlockData, BlockID, BlockData } from '@/types/block';

import { v4 as uuidv4 } from 'uuid';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useUndoRedoStore } from './undoredo';

import { shared } from 'use-broadcast-ts';
import { nodeTypes } from '@/configs/control';
import { Draft } from 'immer';
import _ from 'lodash';
import { BlockAddPayload } from '@/types/block';

interface FlowchartState {
  nodes: Node<BlockData>[];
  edges: Edge[];
  controls: Node[];

  functionDefinitionBlocks: Record<BlockID, Node<BuiltinBlockData>>;

  setNodes: (nodes: Node<BuiltinBlockData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setControls: (edges: Node[]) => void;

  updateBlock: (id: string, mutation: (block: Draft<Node<BuiltinBlockData>>) => void) => void;

  saveDefinition: (definitionBlockId: string) => void;
  removeDefinition: (name: string) => void;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onControlsChange: OnNodesChange;

  onConnect: OnConnect;

  addNode: (payload: BlockAddPayload, position: XYPosition) => void;
  deleteNode: (id: string) => void;
  reset: () => void;
}

export const useFlowchartStore = create<FlowchartState>()(
  shared(
    persist(
      immer((set, get) => ({
        nodes: [] as Node<BlockData>[],
        edges: [] as Edge[],
        controls: [] as Node[],

        functionDefinitionBlocks: {},

        setNodes: (nodes: Node<BlockData>[]) => set({ nodes }),
        setEdges: (edges: Edge[]) => set({ edges }),
        setControls: (controls: Node[]) => set({ controls }),

        updateBlock: (id: string, mutation: (block: Draft<Node<BuiltinBlockData>>) => void) => {
          set((state) => {
            const block = state.nodes.find((n) => n.id === id);
            if (!block) {
              throw new Error('Tried to update non-existant block');
            }
            if (!isBuiltinBlock(block)) {
              throw new Error("Can't update non-builtin block");
            }

            mutation(block);
          });
        },

        saveDefinition: (definitionBlockId: BlockID) => {
          set((state) => {
            const node = state.nodes.find((n) => n.id === definitionBlockId);
            if (!node || !isFunctionDefinitionBlock(node)) {
              return;
            }

            state.functionDefinitionBlocks[node.id] = node;
          });
        },

        removeDefinition: (definitionBlockId: BlockID) => {
          set((state) => {
            delete state.functionDefinitionBlocks[definitionBlockId];
          });
        },

        onNodesChange: (changes: NodeChange[]) => {
          for (const change of changes) {
            if (change.type === 'remove' && change.id in get().functionDefinitionBlocks) {
              get().removeDefinition(change.id);
            }
          }

          set({
            nodes: applyNodeChanges(changes, get().nodes)
          });
        },
        onEdgesChange: (changes: EdgeChange[]) => {
          set({
            edges: applyEdgeChanges(changes, get().edges)
          });
        },
        onControlsChange: (changes: NodeChange[]) => {
          set({
            controls: applyNodeChanges(changes, get().controls)
          });
        },

        onConnect: (connection: Connection) => {
          const undoredoStore = useUndoRedoStore.getState();
          undoredoStore.takeSnapshot();
          set({
            edges: addEdge(connection, get().edges)
          });
        },
        addNode: (payload: BlockAddPayload, position: XYPosition) => {
          const undoredoStore = useUndoRedoStore.getState();
          undoredoStore.takeSnapshot();
          const uuid = uuidv4();

          const parent = get().nodes.find((n) => {
            if (!n.width || !n.height) return false;

            return (
              n.type === 'flojoy.intrinsics.function' &&
              n.position.x < position.x &&
              n.position.x + n.width > position.x &&
              n.position.y < position.y &&
              n.position.y + n.height > position.y
            );
          });

          // The position of parents within subflows is measured relative to the parent
          // so we need to convert from absolute position to relative position for child nodes
          const adjustedPosition = !parent
            ? position
            : {
                x: position.x - parent.position.x,
                y: position.y - parent.position.y
              };

          let data: BlockData;
          switch (payload.variant) {
            case 'builtin':
              data = {
                block_type: payload.block_type,
                label: payload.block_type,
                intrinsic_parameters:
                  payload.block_type === 'flojoy.math.constant' ? { val: 0 } : {},
                // TODO: Change this when builtin blocks will actually
                // use the inputs and outputs fields to render their handles
                // based on python function information
                inputs: payload.block_type === 'flojoy.intrinsics.function' ? { inp: 'int' } : {},
                outputs: payload.block_type === 'flojoy.intrinsics.function' ? { out: 'int' } : {}
              };
              break;
            case 'function_instance': {
              const definitions = get().functionDefinitionBlocks;
              const defnId = payload.definition_block_id;
              if (!(defnId in definitions)) {
                throw new Error(`Undefined function block ${defnId}`);
              }

              data = {
                block_type: 'function_instance',
                definition_block_id: defnId
              };
              break;
            }
          }

          set({
            nodes: get().nodes.concat([
              {
                id: `${data.block_type}-${uuid}`,
                type: data.block_type,
                position: adjustedPosition,
                data,
                parentNode: parent ? parent.id : undefined,
                extent: parent ? 'parent' : undefined
              }
            ])
          });
          if (Object.keys(nodeTypes).includes(data.block_type)) {
            set({
              controls: get().controls.concat([
                {
                  id: uuid,
                  type: data.block_type,
                  position: position,
                  data: {
                    label: data.block_type,
                    block_type: data.block_type
                  }
                }
              ])
            });
          }
        },

        deleteNode: (id: string) => {
          get().onNodesChange([{ type: 'remove', id }]);
          set({
            edges: get().edges.filter((e) => e.source !== id && e.target !== id)
          });
        },

        reset: () => {
          set({
            nodes: [],
            edges: [],
            controls: []
          });
        }
      })),
      {
        name: 'flow-state',
        storage: createJSONStorage(() => localStorage)
      }
    )
  )
);

const isBuiltinBlock = (node: Node<BlockData>): node is Node<BuiltinBlockData> => {
  return node.data.block_type !== 'function_instance';
};

const isFunctionDefinitionBlock = (node: Node<BlockData>): node is Node<BuiltinBlockData> => {
  return node.data.block_type === 'flojoy.intrinsics.function';
};

export const useBlockUpdate = (id: string) => {
  const update = useFlowchartStore((state) => state.updateBlock);

  return _.curry(update)(id);
};
