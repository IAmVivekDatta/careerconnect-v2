import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthStore();

  if (user?.role !== "admin") {
    return <Navigate to="/feed" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
