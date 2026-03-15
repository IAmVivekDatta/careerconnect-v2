const AdminSettingsPage = () => {
  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold">Platform Settings</h2>
        <p className="text-sm text-muted">
          Manage global configuration and admin credentials.
        </p>
      </header>
      <form className="neon-border space-y-4 rounded-lg bg-card/90 p-6">
        <div className="space-y-2">
          <label htmlFor="admin-support-email" className="text-sm font-medium">
            Support Email
          </label>
          <input
            id="admin-support-email"
            name="supportEmail"
            className="w-full rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-sidebar-active focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-active/50"
            placeholder="support@careerconnect.com"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="admin-invite-code" className="text-sm font-medium">
            Invite Code
          </label>
          <input
            id="admin-invite-code"
            name="inviteCode"
            className="w-full rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-sidebar-active focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-active/50"
            placeholder="Optional alumni invite code"
          />
        </div>
        <button
          type="submit"
          className="neon-border rounded px-4 py-2 text-sm font-semibold text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-active/50"
        >
          Save Settings
        </button>
      </form>
    </section>
  );
};

export default AdminSettingsPage;
