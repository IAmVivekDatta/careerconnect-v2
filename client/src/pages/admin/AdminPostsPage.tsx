const AdminPostsPage = () => {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold">Moderate Posts</h2>
        <p className="text-sm text-muted">Review and remove inappropriate content.</p>
      </header>
      <div className="neon-border rounded-lg bg-surface/80 p-4">
        <p className="text-sm text-white/80">Pending post approvals will show here.</p>
      </div>
    </section>
  );
};

export default AdminPostsPage;
