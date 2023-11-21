import Header from '@/components/root/Header';
import StatusBar from '@/components/root/StatusBar';
import { Outlet } from 'react-router-dom';

const Home = () => {
  return (
    <div className="h-screen bg-muted">
      <Header />
      <Outlet />
      <StatusBar />
    </div>
  );
};

export default Home;
