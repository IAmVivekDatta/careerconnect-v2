const AdminOpportunitiesPage = () => {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold">Approve Opportunities</h2>
        <p className="text-sm text-muted">Approve or reject user-submitted job posts.</p>
      </header>
      <div className="neon-border rounded-lg bg-surface/80 p-4">
        <p className="text-sm text-white/80">Queue of pending opportunities will display here.</p>
      </div>
    </section>
  );
};

export default AdminOpportunitiesPage;
