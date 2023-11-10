import BlockLibrary from '@/components/flow/BlockLibrary';
import FlowCanvas from '@/components/flow/FlowCanvas';

import { Mosaic, MosaicWindow } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import Editor from '@/components/editor/Editor';

const Flow = (): JSX.Element => {
  const TITLE_MAP: Record<ViewId, string> = {
    block_library: 'Block Library',
    flow_canvas: 'Flow Canvas',
    code_editor: 'Code Editor'
  };

  type ViewId = 'block_library' | 'flow_canvas' | 'code_editor';

  const ELEMENT_MAP: Record<ViewId, JSX.Element> = {
    block_library: <BlockLibrary />,
    flow_canvas: <FlowCanvas />,
    code_editor: <Editor />
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
          second: {
            direction: 'column',
            first: 'flow_canvas',
            second: 'code_editor'
          }
        }}
      />
    </div>
  );
};

export default Flow;
