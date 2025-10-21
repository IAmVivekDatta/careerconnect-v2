import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="min-h-screen bg-bgDark text-white">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
