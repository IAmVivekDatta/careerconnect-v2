import { Outlet } from 'react-router-dom';
import AdminSidebar from '../organisms/AdminSidebar';
import AdminTopNav from '../organisms/AdminTopNav';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-bgDark text-white">
      <AdminTopNav />
      <div className="cc-container flex px-6 py-10">
        <AdminSidebar />
        <main className="flex-1 px-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
