import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/axios";
import { AdminStats } from "../../types";

interface ReportCard {
  title: string;
  value: string;
  caption: string;
}

const AdminReportsPage = () => {
  const { data: stats, isLoading, isFetching } = useQuery<AdminStats>({
    queryKey: ["admin-reports-stats"],
    queryFn: async () => {
      const response = await api.get<AdminStats>("/admin/stats");
      return response.data;
    }
  });

  const reportCards: ReportCard[] = useMemo(() => {
    if (!stats) return [];
    const totalUsers = stats.users.total || 1;
    const engagementRate = ((stats.users.active30d / totalUsers) * 100).toFixed(1);
    const approvalRate = stats.opportunities.total
      ? ((stats.opportunities.approved / stats.opportunities.total) * 100).toFixed(1)
      : "0.0";

    return [
      {
        title: "Active Users (30d)",
        value: stats.users.active30d.toLocaleString(),
        caption: `${engagementRate}% of total users`
      },
      {
        title: "Posts Published Today",
        value: stats.posts.today.toLocaleString(),
        caption: `${stats.posts.total.toLocaleString()} lifetime posts`
      },
      {
        title: "Opportunities Approved",
        value: stats.opportunities.approved.toLocaleString(),
        caption: `${approvalRate}% of submissions approved`
      }
    ];
  }, [stats]);

  if (isLoading || isFetching) {
    return (
      <section className="space-y-6">
        <header>
          <h2 className="text-xl font-semibold text-white">Platform Reports</h2>
          <p className="text-sm text-muted">Loading insights…</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="neon-border h-32 animate-pulse rounded-lg bg-surface/60" />
          ))}
        </div>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="space-y-4 text-white">
        <h2 className="text-xl font-semibold">Platform Reports</h2>
        <p className="text-sm text-red-300">Unable to load reports at this time.</p>
      </section>
    );
  }

  const studentShare = stats.users.total
    ? Math.round((stats.users.students / stats.users.total) * 100)
    : 0;
  const alumniShare = stats.users.total
    ? Math.round((stats.users.alumni / stats.users.total) * 100)
    : 0;
  const pendingRate = stats.opportunities.total
    ? Math.round((stats.opportunities.pending / stats.opportunities.total) * 100)
    : 0;

  return (
    <section className="space-y-6 text-white">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-neonMagenta">Platform Reports</h2>
        <p className="text-sm text-muted">A deeper look into user engagement, content activity, and opportunity pipeline.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {reportCards.map((card) => (
          <article key={card.title} className="neon-border rounded-lg bg-surface/80 p-5">
            <h3 className="text-sm font-semibold text-white/60">{card.title}</h3>
            <p className="mt-4 text-3xl font-bold text-neonCyan">{card.value}</p>
            <p className="mt-2 text-xs text-white/60">{card.caption}</p>
          </article>
        ))}
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-neonCyan">User Composition</h3>
        <div className="neon-border rounded-lg bg-surface/80 p-5">
          <div className="space-y-4 text-sm text-white/70">
            <div>
              <div className="flex justify-between">
                <span>Students</span>
                <span>{stats.users.students.toLocaleString()} ({studentShare}%)</span>
              </div>
              <div className="mt-2 h-2 rounded bg-white/10">
                <div
                  className="h-full rounded bg-neonCyan/70"
                  style={{ width: `${studentShare}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between">
                <span>Alumni</span>
                <span>{stats.users.alumni.toLocaleString()} ({alumniShare}%)</span>
              </div>
              <div className="mt-2 h-2 rounded bg-white/10">
                <div
                  className="h-full rounded bg-neonMagenta/70"
                  style={{ width: `${alumniShare}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-neonCyan">Opportunity Pipeline</h3>
        <div className="neon-border rounded-lg bg-surface/80 p-5">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <h4 className="text-sm font-semibold text-white/60">Total Submitted</h4>
              <p className="mt-2 text-2xl font-bold text-white">{stats.opportunities.total}</p>
              <p className="text-xs text-white/50">All time</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white/60">Pending Review</h4>
              <p className="mt-2 text-2xl font-bold text-yellow-200">{stats.opportunities.pending}</p>
              <p className="text-xs text-white/50">{pendingRate}% of pipeline</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white/60">Approved</h4>
              <p className="mt-2 text-2xl font-bold text-green-200">{stats.opportunities.approved}</p>
              <p className="text-xs text-white/50">Live on the platform</p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-neonCyan">Operational Insights</h3>
        <div className="neon-border rounded-lg bg-surface/80 p-5 text-sm text-white/70">
          <ul className="space-y-2 list-disc pl-5">
            <li>
              Focus on re-engaging inactive users — {stats.users.total - stats.users.active30d} members have not interacted in the last 30 days.
            </li>
            <li>
              With {stats.posts.today.toLocaleString()} posts today, content moderation should prioritise high-traffic windows.
            </li>
            <li>
              There are {stats.opportunities.pending.toLocaleString()} opportunities awaiting review; keeping approvals timely maintains trust with employers.
            </li>
          </ul>
        </div>
      </section>
    </section>
  );
};

export default AdminReportsPage;
