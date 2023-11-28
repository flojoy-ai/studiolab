import { ChangeEvent } from 'react';
import { BlockProps } from '@/types/block';
import { useBlockState } from '@/hooks/useBlockState';

const SliderBlock = ({ id }: BlockProps) => {
  const [value, update] = useBlockState(id, 50);

  const handleSetSlider = (event: ChangeEvent<HTMLInputElement>): void => {
    update(parseInt(event.target.value));
  };

  return (
    <>
      <div className="rounded-md border p-4">
        <div className="flex justify-center">{value}</div>
        <input
          className="nodrag"
          type="range"
          min="0"
          max="100"
          onChange={handleSetSlider}
          value={value}
        />
      </div>
    </>
  );
};

export default SliderBlock;
