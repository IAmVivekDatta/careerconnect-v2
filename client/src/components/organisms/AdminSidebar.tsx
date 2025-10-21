import { NavLink } from "react-router-dom";

const adminLinks = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/posts", label: "Posts" },
  { to: "/admin/opportunities", label: "Opportunities" },
  { to: "/admin/settings", label: "Settings" }
];

const AdminSidebar = () => {
  return (
    <aside className="hidden w-64 border-r border-white/10 bg-surface/90 p-4 md:flex md:flex-col">
      <nav className="flex flex-col gap-2">
        {adminLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded px-3 py-2 text-sm transition hover:bg-white/5 ${
                isActive ? "text-neonMagenta" : "text-muted"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
