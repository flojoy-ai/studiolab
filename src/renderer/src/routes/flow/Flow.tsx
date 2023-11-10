import BlockLibrary from '@/components/flow/BlockLibrary';
import FlowCanvas from '@/components/flow/FlowCanvas';

import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

const Flow = (): JSX.Element => {
  const TITLE_MAP: Record<ViewId, string> = {
    block_library: 'Block Library',
    flow_canvas: 'Flow Canvas'
  };

  type ViewId = 'block_library' | 'flow_canvas';

  const ELEMENT_MAP: Record<ViewId, JSX.Element> = {
    block_library: <BlockLibrary />,
    flow_canvas: <FlowCanvas />
  };

  return (
    <div className="main-content flex rounded-lg bg-muted p-4">
      <Mosaic<ViewId>
        renderTile={(id, path) => (
          <MosaicWindow<ViewId>
            path={path}
            createNode={() => 'block_library'}
            title={TITLE_MAP[id]}
          >
            {ELEMENT_MAP[id]}
          </MosaicWindow>
        )}
        initialValue={{
          direction: 'row',
          first: 'block_library',
          second: 'flow_canvas'
        }}
      />
    </div>
  );
};

export default Flow;
