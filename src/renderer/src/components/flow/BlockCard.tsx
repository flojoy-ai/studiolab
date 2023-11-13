import { Button } from '../ui/Button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';

type Props = {
  name: string;
  desc: string;
  onClick: () => void;
};

const BlockCard = ({ name, desc, onClick }: Props): JSX.Element => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button className="" variant="secondary" onClick={onClick}>
            <div>{name}</div>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div>{desc}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BlockCard;
