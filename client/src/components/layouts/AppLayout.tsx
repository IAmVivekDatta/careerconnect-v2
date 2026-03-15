import { Outlet } from 'react-router-dom';
import TopNav from '../organisms/TopNav';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-bgDark text-white">
      <TopNav />
      <main className="cc-container px-6 py-10">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
