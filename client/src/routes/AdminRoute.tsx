import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import useAuthHydration from "../hooks/useAuthHydration";

const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuthStore();
  const isHydrated = useAuthHydration();

  if (!isHydrated) {
    return null;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/feed" replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
