import { useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import { adminNavItems } from '../../constants/navItems';
import type { AppNavItem } from '../../constants/navItems';

const AdminSidebar = () => {
  const { user } = useAuthStore();

  const links = useMemo<AppNavItem[]>(() => {
    if (!user) return [];
    return adminNavItems.filter(
      (item) => !item.roles || item.roles.includes(user.role)
    );
  }, [user]);

  if (!links.length) {
    return null;
  }

  return (
    <aside className="hidden w-64 border-r border-white/10 bg-surface/90 p-4 md:flex md:flex-col">
      <nav className="flex flex-col gap-1">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  isActive
                    ? 'bg-neonMagenta/15 text-white shadow-[0_0_18px_rgba(255,0,170,0.18)]'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`h-4 w-4 ${
                      isActive
                        ? 'text-neonMagenta'
                        : 'text-white/65 group-hover:text-neonMagenta'
                    }`}
                  />
                  <span>{link.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
