import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import RecommendedAlumniCarousel from '../../components/organisms/RecommendedAlumniCarousel';
import { TrainingOpportunitiesCarousel } from '../../components/organisms/TrainingOpportunitiesCarousel';
import { AdminStats } from '../../types';

const StatCard = ({
  label,
  value,
  tone
}: {
  label: string;
  value: number;
  tone: string;
}) => (
  <article className="neon-border rounded-lg bg-card/95 p-6 shadow-lg">
    <h3 className="text-sm font-semibold text-white/70">{label}</h3>
    <p className={`mt-3 text-3xl font-bold ${tone}`}>
      {value.toLocaleString()}
    </p>
  </article>
);

const AdminDashboardPage = () => {
  const navigate = useNavigate();
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
          <div
            key={i}
            className="neon-border h-24 animate-pulse rounded-lg bg-card/60"
          />
        ))}
      </div>
    );
  }

  if (!stats) return <div className="p-8 text-white">Failed to load stats</div>;

  return (
    <main className="space-y-8 p-8 text-white">
      <header className="space-y-2">
        <h2 className="text-3xl font-bold text-neonMagenta">Admin Dashboard</h2>
        <p className="text-sm text-muted">
          Real-time platform metrics and health indicators.
        </p>
      </header>

      {/* Users Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan">Users Overview</h3>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Users"
            value={stats.users.total}
            tone="text-neonCyan"
          />
          <StatCard
            label="Students"
            value={stats.users.students}
            tone="text-emerald-300"
          />
          <StatCard
            label="Alumni"
            value={stats.users.alumni}
            tone="text-violet-300"
          />
          <StatCard
            label="Active (30d)"
            value={stats.users.active30d}
            tone="text-amber-200"
          />
        </div>
      </section>

      {/* Feed Activity Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan">Feed Activity</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            label="Total Posts"
            value={stats.posts.total}
            tone="text-indigo-300"
          />
          <StatCard
            label="Posts (Today)"
            value={stats.posts.today}
            tone="text-pink-300"
          />
        </div>
      </section>

      {/* Opportunities Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan">Opportunities</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            label="Total Listings"
            value={stats.opportunities.total}
            tone="text-teal-300"
          />
          <StatCard
            label="Pending Approval"
            value={stats.opportunities.pending}
            tone="text-rose-300"
          />
          <StatCard
            label="Approved"
            value={stats.opportunities.approved}
            tone="text-green-300"
          />
        </div>
      </section>

      {/* Quick Actions */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan">Quick Actions</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Manage Users', to: '/admin/users' },
            { label: 'Review Posts', to: '/admin/posts' },
            { label: 'Approve Jobs', to: '/admin/opportunities' },
            { label: 'View Reports', to: '/admin/reports' }
          ].map((action) => (
            <button
              key={action.label}
              className="neon-border rounded-lg bg-card/95 px-4 py-3 font-medium text-white transition hover:border-sidebar-active/60 hover:bg-sidebar-active/15"
              type="button"
              onClick={() => navigate(action.to)}
            >
              {action.label}
            </button>
          ))}
        </div>
      </section>

      {/* Recommended Alumni Preview */}
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-neonCyan">
          Featured Alumni Network
        </h3>
        <RecommendedAlumniCarousel />
      </section>

      {/* Training Opportunities Preview */}
      <section className="space-y-4">
        <TrainingOpportunitiesCarousel />
      </section>
    </main>
  );
};

export default AdminDashboardPage;
