import { isPackaged } from '@/utils/build';

type Props = {
  title: string;
};

const Header = ({ title }: Props): JSX.Element => {
  return (
    <div className="titlebar flex h-12 items-center justify-center gap-2 bg-background">
      <div>{title + ' ' + (!isPackaged() && 'DEV')}</div>
    </div>
  );
};

export default Header;
