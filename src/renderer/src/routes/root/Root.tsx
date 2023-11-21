import { ThemeProvider } from '@/providers/ThemeProvider';
import { Outlet } from 'react-router-dom';

const Root = (): JSX.Element => {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
};

export default Root;
