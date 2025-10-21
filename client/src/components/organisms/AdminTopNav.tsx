import useAuthStore from "../../store/useAuthStore";

const AdminTopNav = () => {
  const { user } = useAuthStore();

  return (
    <header className="flex items-center justify-between border-b border-white/10 bg-surface/80 px-6 py-4">
      <h1 className="text-lg font-semibold text-neonMagenta">Admin Console</h1>
      <p className="text-sm text-muted">{user?.email}</p>
    </header>
  );
};

export default AdminTopNav;
