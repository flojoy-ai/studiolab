import { MutableRefObject, useCallback, useState } from 'react';
import { ContextMenuProps } from '@/components/flow/ContextMenu';

export const useContextMenu = (reactFlowRef: MutableRefObject<HTMLDivElement | null>) => {
  const [menu, setMenu] = useState<ContextMenuProps | null>(null);

  const onNodeContextMenu = useCallback(
    (event, node) => {
      // Prevent native context menu from showing
      event.preventDefault();

      if (!reactFlowRef.current) {
        return;
      }

      // Calculate position of the context menu. We want to make sure it
      // doesn't get positioned off-screen.
      const pane = reactFlowRef.current.getBoundingClientRect();
      setMenu({
        id: node.id,
        top: event.clientY < pane.height - 200 ? event.clientY : undefined,
        left: event.clientX < pane.width - 200 ? event.clientX : undefined,
        right: event.clientX >= pane.width - 200 ? pane.width - event.clientX : undefined,
        bottom: event.clientY >= pane.height - 200 ? pane.height - event.clientY : undefined
      });
    },
    [setMenu]
  );

  // Close the context menu if it's open whenever the window is clicked.
  const onPaneClick = useCallback(() => setMenu(null), [setMenu]);

  return { menu, onPaneClick, onNodeContextMenu };
};
