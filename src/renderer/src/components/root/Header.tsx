import { isPackaged } from '@/utils/build';

const Header = (): JSX.Element => {
  return (
    <div className="titlebar flex h-12 items-center justify-center gap-2 bg-background">
      <div>Flojoy Studio</div>
      {!isPackaged() && <span>DEV BUILD</span>}
    </div>
  );
};

export default Header;
