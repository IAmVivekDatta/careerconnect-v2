import { useEffect, useMemo, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import NeonButton from '../atoms/NeonButton';
import Avatar from '../atoms/Avatar';
import useAuthStore from '../../store/useAuthStore';
import { useNavMetrics } from '../../hooks/useNavMetrics';
import { appNavItems } from '../../constants/navItems';
import type { AppNavItem } from '../../constants/navItems';
import DynamoHamburger from '../atoms/DynamoHamburger';
import { useLayoutStore } from '../../store/useLayoutStore';
import ThemeSwitcher from './ThemeSwitcher';

const TopNav = () => {
  const { user, logout } = useAuthStore();
  const { isSidebarOpen, toggleSidebar } = useLayoutStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { connectionCounts, unreadCounts } = useNavMetrics();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleProfileClick = () => {
    if (user?._id) {
      navigate(`/profile/${user._id}`);
    }
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const visibleNavItems = useMemo(() => {
    if (!user) return [];
    return appNavItems.filter(
      (item) => !item.roles || item.roles.includes(user.role)
    );
  }, [user]);

  const getBadgeFor = (path: string) => {
    if (path.startsWith('/connections')) {
      return connectionCounts?.pending ?? 0;
    }
    if (path.startsWith('/messages')) {
      return unreadCounts?.messages ?? 0;
    }
    return 0;
  };

  const renderDesktopLink = (item: AppNavItem) => {
    const Icon = item.icon;
    const isActive =
      location.pathname === item.to ||
      location.pathname.startsWith(`${item.to}/`);
    const badge = getBadgeFor(item.to);

    return (
      <NavLink
        key={item.to}
        to={item.to}
        className={`group flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition ${
          isActive
            ? 'bg-neonCyan/15 text-white shadow-[0_0_18px_rgba(0,255,255,0.15)]'
            : 'text-white/70 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon
          className={`h-4 w-4 ${
            isActive
              ? 'text-neonCyan'
              : 'text-white/50 group-hover:text-neonCyan'
          }`}
        />
        <span>{item.label}</span>
        {badge > 0 && (
          <span className="ml-1 rounded-full bg-neonCyan px-2 text-[10px] font-semibold text-black">
            {badge}
          </span>
        )}
      </NavLink>
    );
  };

  const renderMobileLink = (item: AppNavItem) => {
    const Icon = item.icon;
    const isActive =
      location.pathname === item.to ||
      location.pathname.startsWith(`${item.to}/`);
    const badge = getBadgeFor(item.to);

    return (
      <NavLink
        key={`${item.to}-mobile`}
        to={item.to}
        className={`group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
          isActive
            ? 'bg-neonCyan/10 text-white'
            : 'text-muted hover:bg-white/5 hover:text-white'
        }`}
      >
        <span className="flex items-center gap-2">
          <Icon
            className={`h-4 w-4 ${
              isActive
                ? 'text-neonCyan'
                : 'text-white/40 group-hover:text-neonCyan'
            }`}
          />
          <span>{item.label}</span>
        </span>
        {badge > 0 && (
          <span className="rounded-full bg-neonCyan px-2 py-0.5 text-[10px] font-semibold text-black">
            {badge}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-surface/80 px-4 py-3 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {visibleNavItems.length > 0 && (
            <>
              <DynamoHamburger
                open={mobileOpen}
                onToggle={() => setMobileOpen((open) => !open)}
                className="md:hidden"
                label="Toggle quick menu"
              />
              <DynamoHamburger
                open={isSidebarOpen}
                onToggle={toggleSidebar}
                className="hidden md:flex"
                label="Toggle sidebar"
                size={28}
              />
            </>
          )}
          <Link to="/feed" className="text-lg font-semibold text-neonCyan">
            CareerConnect
          </Link>
        </div>

        <nav className="hidden items-center gap-1 rounded-full border border-white/5 bg-white/5 px-2 py-1 md:flex">
          {visibleNavItems.map((item) => renderDesktopLink(item))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <NeonButton asChild>
            <Link to="/opportunities">Find Opportunities</Link>
          </NeonButton>
          {user && (
            <button
              onClick={logout}
              className="text-xs uppercase tracking-wide text-muted transition hover:text-white"
            >
              Logout
            </button>
          )}
          <button
            onClick={handleProfileClick}
            className="relative flex items-center transition hover:opacity-80"
            aria-label="Open profile"
          >
            <Avatar
              src={user?.profilePicture ?? user?.googlePhotoUrl}
              alt={user?.name ?? 'User'}
            />
            {unreadCounts?.total
              ? unreadCounts.total > 0 && (
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-neonCyan shadow-[0_0_12px_rgba(0,255,255,0.6)]" />
                )
              : null}
          </button>
        </div>
      </div>

      {mobileOpen && visibleNavItems.length > 0 && (
        <div className="mt-3 md:hidden">
          <nav className="flex flex-col gap-1 rounded-lg border border-white/10 bg-surface/95 p-2 shadow-xl shadow-black/40">
            {visibleNavItems.map((item) => renderMobileLink(item))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default TopNav;
