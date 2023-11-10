import Header from '@/components/root/Header';
import StatusBar from '@/components/root/StatusBar';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Outlet } from 'react-router-dom';

const Root = (): JSX.Element => {
  return (
    <ThemeProvider>
      <div className="h-screen bg-muted">
        <Header />
        <Outlet />
        <StatusBar />
      </div>
    </ThemeProvider>
  );
};

export default Root;
