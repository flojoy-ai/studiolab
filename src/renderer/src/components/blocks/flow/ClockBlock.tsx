import { Handle, Position } from 'reactflow';
import { Clock } from 'lucide-react';

const ClockBlock = () => {
  return (
    <>
      <div className="border p-2">
        <Clock />
      </div>
      <Handle type="source" position={Position.Right} id="value" />
      {/* <Handle className="!top-3" type="target" position={Position.Left} id="stop" /> */}
      {/* <Handle className="!top-7" type="target" position={Position.Right} id="start" /> */}
    </>
  );
};

export default ClockBlock;
