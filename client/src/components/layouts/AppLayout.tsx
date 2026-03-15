import { Outlet } from 'react-router-dom';
import TopNav from '../organisms/TopNav';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-bgDark text-white">
      <TopNav />
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AppLayout;
