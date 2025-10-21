const AlumniDirectoryPage = () => {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold">Alumni Directory</h2>
        <p className="text-sm text-muted">Search alumni by batch, company, or skill.</p>
      </header>
      <div className="flex flex-wrap gap-3">
        <select className="rounded bg-white/5 px-3 py-2 text-sm text-white">
          <option value="">Batch</option>
        </select>
        <select className="rounded bg-white/5 px-3 py-2 text-sm text-white">
          <option value="">Company</option>
        </select>
        <select className="rounded bg-white/5 px-3 py-2 text-sm text-white">
          <option value="">Skill</option>
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="neon-border rounded-lg bg-surface/80 p-4">
          <h3 className="text-lg font-semibold text-neonCyan">Alex Johnson</h3>
          <p className="text-sm text-muted">Class of 2018 • Senior Engineer @ InnovateX</p>
        </article>
      </div>
    </section>
  );
};

export default AlumniDirectoryPage;
