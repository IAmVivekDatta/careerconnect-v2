const AchievementsPage = () => {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold">Achievements</h2>
        <p className="text-sm text-muted">Track badges and leaderboard rankings.</p>
      </header>
      <div className="grid gap-4 lg:grid-cols-2">
        <article className="neon-border rounded-lg bg-surface/80 p-4">
          <h3 className="text-lg font-semibold text-neonCyan">Your Badges</h3>
          <p className="text-sm text-muted">Earn badges by completing profile milestones.</p>
        </article>
        <article className="neon-border rounded-lg bg-surface/80 p-4">
          <h3 className="text-lg font-semibold text-neonMagenta">Leaderboard</h3>
          <p className="text-sm text-muted">Leaderboard data will render here.</p>
        </article>
      </div>
    </section>
  );
};

export default AchievementsPage;
