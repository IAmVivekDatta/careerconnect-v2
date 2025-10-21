const AdminSettingsPage = () => {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold">Platform Settings</h2>
        <p className="text-sm text-muted">Manage global configuration and admin credentials.</p>
      </header>
      <form className="neon-border space-y-4 rounded-lg bg-surface/80 p-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Support Email</label>
          <input className="w-full rounded bg-white/5 px-3 py-2 text-sm text-white" placeholder="support@careerconnect.com" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Invite Code</label>
          <input className="w-full rounded bg-white/5 px-3 py-2 text-sm text-white" placeholder="Optional alumni invite code" />
        </div>
        <button type="submit" className="neon-border rounded px-4 py-2 text-sm font-semibold text-white">
          Save Settings
        </button>
      </form>
    </section>
  );
};

export default AdminSettingsPage;
