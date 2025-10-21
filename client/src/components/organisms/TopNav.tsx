import { Link, useNavigate } from "react-router-dom";
import NeonButton from "../atoms/NeonButton";
import Avatar from "../atoms/Avatar";
import useAuthStore from "../../store/useAuthStore";

const TopNav = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    if (user?._id) {
      navigate(`/profile/${user._id}`);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-surface/90 px-6 py-4 backdrop-blur">
      <Link to="/feed" className="text-lg font-semibold text-neonCyan">
        CareerConnect
      </Link>
      <div className="flex items-center gap-4">
        <NeonButton asChild>
          <Link to="/opportunities">Find Opportunities</Link>
        </NeonButton>
        {user && (
          <button onClick={logout} className="text-xs uppercase tracking-wide text-muted">
            Logout
          </button>
        )}
        <button onClick={handleProfileClick} className="transition hover:opacity-80">
          <Avatar src={user?.profilePicture} alt={user?.name ?? "User"} />
        </button>
      </div>
    </header>
  );
};

export default TopNav;
