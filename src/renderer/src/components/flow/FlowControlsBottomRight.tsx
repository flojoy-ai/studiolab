import ClearCanvasButton from './ClearCanvasButton';

const FlowControlsBottomRight = (): JSX.Element => {
  return (
    <div className="absolute bottom-0 right-0 z-50 flex gap-2 p-4">
      <ClearCanvasButton />
    </div>
  );
};

export default FlowControlsBottomRight;
