import { Outlet } from "react-router-dom";
import Sidebar from "../organisms/Sidebar";
import TopNav from "../organisms/TopNav";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-bgDark text-white">
      <TopNav />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
