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
import { BlockData, BlockType, IntrinsicParameterValue } from '@/types/block';

import { v4 as uuidv4 } from 'uuid';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useUndoRedoStore } from './undoredo';

import { shared } from 'use-broadcast-ts';
import { nodeTypes } from '@/configs/control';
import { Draft } from 'immer';

interface FlowchartState {
  nodes: Node<BlockData>[];
  edges: Edge[];
  controls: Node[];

  setNodes: (nodes: Node<BlockData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setControls: (edges: Node[]) => void;

  updateBlock: (id: string, mutation: (block: Draft<Node<BlockData>>) => void) => void;

  updateIntrinsicParameter: (
    id: string,
    paramName: string,
    paramVal: IntrinsicParameterValue
  ) => void;

  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onControlsChange: OnNodesChange;

  onConnect: OnConnect;

  addNode: (block_type: BlockType, position: XYPosition, parent?: string) => void;
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

        setNodes: (nodes: Node<BlockData>[]) => set({ nodes }),
        setEdges: (edges: Edge[]) => set({ edges }),
        setControls: (controls: Node[]) => set({ controls }),

        updateBlock: (id: string, mutation: (block: Draft<Node<BlockData>>) => void) => {
          set((state) => {
            const block = state.nodes.find((n) => n.id === id);
            if (!block) {
              throw new Error('Tried to update intrinsic parameter for non-existant block');
            }
            mutation(block);
          });
        },

        updateIntrinsicParameter: function (
          id: string,
          paramName: string,
          paramVal: IntrinsicParameterValue
        ) {
          this.updateBlock(id, (block) => (block.data.intrinsic_parameters[paramName] = paramVal));
        },

        updateLabel: function (id: string, label: string) {
          this.updateBlock(id, (block) => (block.data.label = label));
        },

        onNodesChange: (changes: NodeChange[]) =>
          set({
            nodes: applyNodeChanges(changes, get().nodes)
          }),
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
        addNode: (block_type: BlockType, position: XYPosition) => {
          const undoredoStore = useUndoRedoStore.getState();
          undoredoStore.takeSnapshot();
          const uuid = uuidv4();

          const parent = get().nodes.find((n) => {
            if (!n.width || !n.height) return false;

            return (
              n.type === 'flojoy.logic.function' &&
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

          const intrinsic_parameters: Record<string, IntrinsicParameterValue> =
            block_type === 'flojoy.math.constant'
              ? {
                  val: 0
                }
              : {};

          const inputs: BlockData['inputs'] =
            block_type === 'flojoy.intrinsics.function'
              ? {
                  In: 'int'
                }
              : {};

          const outputs: BlockData['outputs'] =
            block_type === 'flojoy.intrinsics.function'
              ? {
                  Out: 'int'
                }
              : {};

          set({
            nodes: get().nodes.concat([
              {
                id: uuid,
                type: block_type,
                position: adjustedPosition,
                data: {
                  label: block_type,
                  block_type,
                  intrinsic_parameters,
                  inputs,
                  outputs
                },
                parentNode: parent ? parent.id : undefined,
                extent: parent ? 'parent' : undefined
              }
            ])
          });
          if (Object.keys(nodeTypes).includes(block_type)) {
            set({
              controls: get().controls.concat([
                {
                  id: uuid,
                  type: block_type,
                  position: position,
                  data: {
                    label: block_type,
                    block_type
                  }
                }
              ])
            });
          }
        },

        deleteNode: (id: string) => {
          set({
            nodes: get().nodes.filter((n) => n.id !== id),
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
