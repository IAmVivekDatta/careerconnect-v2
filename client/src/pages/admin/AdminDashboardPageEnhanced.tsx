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
  <div className={`rounded-lg bg-gradient-to-br ${color} p-6 shadow-lg`}>
    <p className="text-sm font-medium text-white/80">{label}</p>
    <p className="mt-2 text-3xl font-bold text-white">{value.toLocaleString()}</p>
  </div>
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
      <div className="grid gap-6 p-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-white/10" />
        ))}
      </div>
    );
  }

  if (!stats) return <div className="p-8 text-white">No data available</div>;

  return (
    <main className="space-y-8 p-8 text-white">
      <header className="space-y-2">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <p className="text-white/60">Platform metrics and overview</p>
      </header>

      {/* Users Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Users" value={stats.users.total} color="from-blue-600 to-blue-800" />
          <StatCard label="Students" value={stats.users.students} color="from-green-600 to-green-800" />
          <StatCard label="Alumni" value={stats.users.alumni} color="from-purple-600 to-purple-800" />
          <StatCard label="Active (30d)" value={stats.users.active30d} color="from-orange-600 to-orange-800" />
        </div>
      </section>

      {/* Posts Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Feed Activity</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard label="Total Posts" value={stats.posts.total} color="from-indigo-600 to-indigo-800" />
          <StatCard label="Posts (Today)" value={stats.posts.today} color="from-pink-600 to-pink-800" />
        </div>
      </section>

      {/* Opportunities Section */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Opportunities</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total Listings" value={stats.opportunities.total} color="from-teal-600 to-teal-800" />
          <StatCard label="Pending Approval" value={stats.opportunities.pending} color="from-red-600 to-red-800" />
          <StatCard label="Approved" value={stats.opportunities.approved} color="from-green-600 to-green-800" />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 font-medium transition hover:shadow-lg hover:shadow-blue-500/50">
            Manage Users
          </button>
          <button className="rounded-lg bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 font-medium transition hover:shadow-lg hover:shadow-purple-500/50">
            Review Posts
          </button>
          <button className="rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-4 py-3 font-medium transition hover:shadow-lg hover:shadow-green-500/50">
            Approve Jobs
          </button>
          <button className="rounded-lg bg-gradient-to-r from-orange-600 to-orange-700 px-4 py-3 font-medium transition hover:shadow-lg hover:shadow-orange-500/50">
            View Reports
          </button>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboardPage;
