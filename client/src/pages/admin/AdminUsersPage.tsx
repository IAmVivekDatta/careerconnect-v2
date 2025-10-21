const AdminUsersPage = () => {
  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Manage Users</h2>
          <p className="text-sm text-muted">Search, filter, and moderate user accounts.</p>
        </div>
        <input className="w-64 rounded bg-white/5 px-3 py-2 text-sm text-white" placeholder="Search by email or name" />
      </header>
      <div className="neon-border rounded-lg bg-surface/80 p-4">
        <p className="text-sm text-white/80">User table will render here.</p>
      </div>
    </section>
  );
};

export default AdminUsersPage;
