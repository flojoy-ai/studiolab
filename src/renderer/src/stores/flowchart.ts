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
import { BlockData, FunctionDefinition, Name } from '@/types/block';

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

  functionDefinitions: Record<Name, FunctionDefinition>;

  setNodes: (nodes: Node<BlockData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  setControls: (edges: Node[]) => void;

  updateBlock: (id: string, mutation: (block: Draft<Node<BlockData>>) => void) => void;

  saveDefinition: (definition: string) => void;
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

        functionDefinitions: {},

        setNodes: (nodes: Node<BlockData>[]) => set({ nodes }),
        setEdges: (edges: Edge[]) => set({ edges }),
        setControls: (controls: Node[]) => set({ controls }),

        updateBlock: (id: string, mutation: (block: Draft<Node<BlockData>>) => void) => {
          set((state) => {
            const block = state.nodes.find((n) => n.id === id);
            if (!block) {
              throw new Error('Tried to update non-existant block');
            }
            mutation(block);
          });
        },

        saveDefinition: (definitionBlockId: string) => {
          set((state) => {
            const node = state.nodes.find((n) => n.id === definitionBlockId);
            if (node === undefined || node.data.block_type !== 'flojoy.intrinsics.function') {
              return;
            }
            const bodyNodes = state.nodes.filter((n) => n.parentNode === definitionBlockId);
            const bodyNodeIds = new Set(bodyNodes.map((n) => n.id));
            bodyNodeIds.add(definitionBlockId);
            const bodyEdges = state.edges.filter(
              (e) => bodyNodeIds.has(e.target) && bodyNodeIds.has(e.source)
            );

            state.functionDefinitions[node.data.label] = {
              block: node.data,
              nodes: bodyNodes,
              edges: bodyEdges
            };
          });
        },

        removeDefinition: (name: string) => {
          set((state) => {
            delete state.functionDefinitions[name];
          });
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
              const definitions = get().functionDefinitions;
              if (!(payload.name in definitions)) {
                throw new Error(`Undefined function block ${payload.name}`);
              }

              const definition = definitions[payload.name];

              data = {
                block_type: 'function_instance',
                label: payload.name,
                intrinsic_parameters: {},
                inputs: definition.block.inputs,
                outputs: definition.block.outputs
              };
              break;
            }
          }

          set({
            nodes: get().nodes.concat([
              {
                id: uuid,
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

export const useBlockUpdate = (id: string) => {
  const update = useFlowchartStore((state) => state.updateBlock);

  return _.curry(update)(id);
};
