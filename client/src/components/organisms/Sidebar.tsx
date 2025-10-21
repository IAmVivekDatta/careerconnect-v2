import { NavLink } from "react-router-dom";

const links = [
  { to: "/feed", label: "Feed" },
  { to: "/opportunities", label: "Opportunities" },
  { to: "/alumni", label: "Alumni" },
  { to: "/connections", label: "Connections" },
  { to: "/achievements", label: "Achievements" },
  { to: "/messages", label: "Messages" }
];

const Sidebar = () => {
  return (
    <aside className="hidden w-64 flex-col border-r border-white/10 bg-surface/90 p-4 md:flex">
      <nav className="flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded px-3 py-2 text-sm transition hover:bg-white/5 ${
                isActive ? "text-neonCyan" : "text-muted"
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

export default Sidebar;
