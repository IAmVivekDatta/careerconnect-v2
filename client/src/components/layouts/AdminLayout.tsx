import { Outlet } from "react-router-dom";
import AdminSidebar from "../organisms/AdminSidebar";
import AdminTopNav from "../organisms/AdminTopNav";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-bgDark text-white">
      <AdminTopNav />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
