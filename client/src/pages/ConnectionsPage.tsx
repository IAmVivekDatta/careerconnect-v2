const ConnectionsPage = () => {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold">Connections</h2>
        <p className="text-sm text-muted">Manage requests and discover new people.</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="neon-border rounded-lg bg-surface/80 p-4">
          <h3 className="text-lg font-semibold">Pending Requests</h3>
          <p className="text-sm text-muted">Incoming connection requests will appear here.</p>
        </article>
        <article className="neon-border rounded-lg bg-surface/80 p-4">
          <h3 className="text-lg font-semibold">Suggestions</h3>
          <p className="text-sm text-muted">Suggested connections based on mutual skills.</p>
        </article>
      </div>
    </section>
  );
};

export default ConnectionsPage;
