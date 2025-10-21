import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';

interface AdminStats {
  users: {
    total: number;
    students: number;
    alumni: number;
    active30d: number;
  };
  posts: {
    total: number;
    today: number;
  };
  opportunities: {
    total: number;
    pending: number;
    approved: number;
  };
}

const StatCard = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <article className={`neon-border rounded-lg bg-gradient-to-br ${color} p-6 shadow-lg`}>
    <h3 className="text-sm font-semibold text-white/70">{label}</h3>
    <p className="mt-3 text-3xl font-bold text-neonCyan">{value.toLocaleString()}</p>
  </article>
);

const AdminDashboardPage = () => {
  const { data: stats, isLoading } = useQuery<AdminStats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/stats');
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 p-8 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="neon-border h-24 animate-pulse rounded-lg bg-surface/50" />
        ))}
      </div>
    );
  }

  if (!stats) return <div className="p-8 text-white">Failed to load stats</div>;

  return (
    <main className="space-y-8 p-8 text-white">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold text-neonMagenta">Admin Dashboard</h2>
        <p className="text-sm text-muted">Real-time platform metrics and health indicators.</p>
      </header>

      {/* Users Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan">Users Overview</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Users" value={stats.users.total} color="from-blue-900/50 to-blue-800/50" />
          <StatCard label="Students" value={stats.users.students} color="from-green-900/50 to-green-800/50" />
          <StatCard label="Alumni" value={stats.users.alumni} color="from-purple-900/50 to-purple-800/50" />
          <StatCard label="Active (30d)" value={stats.users.active30d} color="from-orange-900/50 to-orange-800/50" />
        </div>
      </section>

      {/* Feed Activity Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan">Feed Activity</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard label="Total Posts" value={stats.posts.total} color="from-indigo-900/50 to-indigo-800/50" />
          <StatCard label="Posts (Today)" value={stats.posts.today} color="from-pink-900/50 to-pink-800/50" />
        </div>
      </section>

      {/* Opportunities Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan">Opportunities</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Total Listings" value={stats.opportunities.total} color="from-teal-900/50 to-teal-800/50" />
          <StatCard label="Pending Approval" value={stats.opportunities.pending} color="from-red-900/50 to-red-800/50" />
          <StatCard label="Approved" value={stats.opportunities.approved} color="from-green-900/50 to-green-800/50" />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Manage Users', color: 'from-blue-600 to-blue-700' },
            { label: 'Review Posts', color: 'from-purple-600 to-purple-700' },
            { label: 'Approve Jobs', color: 'from-green-600 to-green-700' },
            { label: 'View Reports', color: 'from-orange-600 to-orange-700' }
          ].map((action) => (
            <button
              key={action.label}
              className={`neon-border rounded-lg bg-gradient-to-r ${action.color} px-4 py-3 font-medium text-white transition hover:shadow-lg hover:shadow-neonCyan/50`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
};

export default AdminDashboardPage;
