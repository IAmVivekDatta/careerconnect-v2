import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./components/layouts/AppLayout";
import AdminLayout from "./components/layouts/AdminLayout";
import PublicLayout from "./components/layouts/PublicLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import OpportunitiesPage from "./pages/OpportunitiesPage";
import OpportunityDetailPage from "./pages/OpportunityDetailPage";
import AlumniDirectoryPage from "./pages/AlumniDirectoryPage";
import ConnectionsPage from "./pages/ConnectionsPage";
import AchievementsPage from "./pages/AchievementsPage";
import MessagesPage from "./pages/MessagesPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminPostsPage from "./pages/admin/AdminPostsPage";
import AdminOpportunitiesPage from "./pages/admin/AdminOpportunitiesPage";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage";
import LandingPage from "./pages/public/LandingPage";
import AuthSelectPage from "./pages/public/AuthSelectPage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";
import AdminLoginPage from "./pages/public/AdminLoginPage";

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/auth", element: <AuthSelectPage /> },
      { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/admin/login", element: <AdminLoginPage /> }
    ]
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/feed", element: <FeedPage /> },
      { path: "/profile/:id", element: <ProfilePage /> },
      { path: "/profile/edit", element: <EditProfilePage /> },
      { path: "/opportunities", element: <OpportunitiesPage /> },
      { path: "/opportunity/:id", element: <OpportunityDetailPage /> },
      { path: "/alumni", element: <AlumniDirectoryPage /> },
      { path: "/connections", element: <ConnectionsPage /> },
      { path: "/achievements", element: <AchievementsPage /> },
      { path: "/messages", element: <MessagesPage /> }
    ]
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <AdminRoute>
          <AdminLayout />
        </AdminRoute>
      </ProtectedRoute>
    ),
    children: [
      { path: "dashboard", element: <AdminDashboardPage /> },
      { path: "users", element: <AdminUsersPage /> },
      { path: "posts", element: <AdminPostsPage /> },
      { path: "opportunities", element: <AdminOpportunitiesPage /> },
      { path: "settings", element: <AdminSettingsPage /> }
    ]
  }
]);

export default router;
