import BlockLibrary from '@/components/flow/BlockLibrary';
import FlowCanvas from '@/components/flow/FlowCanvas';

import { Mosaic } from 'react-mosaic-component';
import 'react-mosaic-component/react-mosaic-component.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

const Flow = (): JSX.Element => {
  const ELEMENT_MAP: { [viewId: string]: JSX.Element } = {
    a: <BlockLibrary />,
    b: <FlowCanvas />
  };

  return (
    <div className="main-content flex rounded-lg bg-muted p-4">
      <Mosaic<string>
        renderTile={(id) => ELEMENT_MAP[id]}
        initialValue={{
          direction: 'row',
          first: 'a',
          second: 'b',
          splitPercentage: 40
        }}
      />
    </div>
  );
};

export default Flow;
