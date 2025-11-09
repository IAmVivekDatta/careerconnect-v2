import clsx from "clsx";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import useAuthStore from "../../store/useAuthStore";
import { useNavMetrics } from "../../hooks/useNavMetrics";
import { appNavItems } from "../../constants/navItems";
import type { AppNavItem } from "../../constants/navItems";
import { useLayoutStore } from "../../store/useLayoutStore";

const Sidebar = () => {
  const { user } = useAuthStore();
  const { connectionCounts, unreadCounts } = useNavMetrics();
  const { isSidebarOpen } = useLayoutStore();

  const links = useMemo<AppNavItem[]>(() => {
    if (!user) return [];
    return appNavItems.filter((item) => !item.roles || item.roles.includes(user.role));
  }, [user]);

  const getBadgeFor = (path: string) => {
    if (path.startsWith("/connections")) {
      return connectionCounts?.pending ?? 0;
    }
    if (path.startsWith("/messages")) {
      return unreadCounts?.messages ?? 0;
    }
    return 0;
  };

  if (!links.length) {
    return null;
  }

  return (
    <aside
      className={clsx(
        "hidden flex-col border-r border-white/10 bg-surface/90 transition-all duration-300 ease-in-out md:flex",
        isSidebarOpen
          ? "w-64 px-4 py-4 opacity-100"
          : "pointer-events-none w-0 overflow-hidden px-0 py-0 opacity-0"
      )}
      aria-hidden={!isSidebarOpen}
    >
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;
          const badge = getBadgeFor(link.to);

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-neonCyan/10 text-white shadow-[0_0_18px_rgba(0,255,255,0.12)]"
                    : "text-muted hover:bg-white/5 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? "text-neonCyan"
                          : "text-white/40 group-hover:text-neonCyan"
                      }`}
                    />
                    <span
                      className={clsx(
                        "transition-opacity duration-200",
                        isSidebarOpen ? "opacity-100" : "opacity-0"
                      )}
                    >
                      {link.label}
                    </span>
                  </span>
                  {badge > 0 && isSidebarOpen && (
                    <span className="rounded-full bg-neonCyan px-2 py-0.5 text-[10px] font-semibold text-black">
                      {badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
