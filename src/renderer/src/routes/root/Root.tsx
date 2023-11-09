import Header from '@/components/root/Header';
import StatusBar from '@/components/root/StatusBar';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Outlet } from 'react-router-dom';

export const Root = (): JSX.Element => {
  return (
    <ThemeProvider>
      <div className="flex h-screen flex-col bg-muted">
        <Header />
        <Outlet />
        <StatusBar />
      </div>
    </ThemeProvider>
  );
};

export const tanner = 'hello';
