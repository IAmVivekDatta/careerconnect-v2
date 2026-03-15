import useAuthStore from '../../store/useAuthStore';

const AdminTopNav = () => {
  const { user } = useAuthStore();

  return (
    <header className="border-b border-border bg-[#0b0b0b]/95 px-6 py-4">
      <div className="cc-container flex items-center justify-between">
        <h1 className="text-lg font-bold text-neonCyan">Admin Console</h1>
        <p className="text-sm text-muted">{user?.email}</p>
      </div>
    </header>
  );
};

export default AdminTopNav;
