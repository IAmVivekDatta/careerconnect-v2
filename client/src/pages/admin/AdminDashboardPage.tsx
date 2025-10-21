const AdminDashboardPage = () => {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold text-neonMagenta">Admin Dashboard</h2>
        <p className="text-sm text-muted">Monitor platform health and key metrics.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["Total Users", "Active Users (30d)", "Posts (24h)", "Open Jobs"].map((stat) => (
          <article key={stat} className="neon-border rounded-lg bg-surface/80 p-4">
            <h3 className="text-sm font-semibold text-white/70">{stat}</h3>
            <p className="mt-2 text-2xl font-bold text-neonCyan">--</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AdminDashboardPage;
