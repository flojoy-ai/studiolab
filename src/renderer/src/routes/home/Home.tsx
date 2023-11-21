import Header from '@/components/root/Header';
import StatusBar from '@/components/root/StatusBar';
import { Outlet } from 'react-router-dom';

import { version } from '@/../../package.json';

const Home = () => {
  return (
    <div className="h-screen bg-muted">
      <Header title={`Flojoy Studio ${version}`} />
      <Outlet />
      <StatusBar />
    </div>
  );
};

export default Home;
