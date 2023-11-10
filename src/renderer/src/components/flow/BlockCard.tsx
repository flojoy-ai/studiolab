import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/Tooltip';

type Props = {
  name: string;
  desc: string;
  onClick?: () => void;
};

const BlockCard = ({ name, desc, onClick }: Props): JSX.Element => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="rounded-lg bg-primary-foreground p-2" onClick={onClick}>
            <div>{name}</div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right">
          <div>{desc}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default BlockCard;
