import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import type { FeedbackItem } from '../../types';

type SettingsTab = 'general' | 'feedback';

interface AdminFeedbackResponse {
  data: FeedbackItem[];
  total: number;
}

const AdminSettingsPage = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<
    'all' | 'pending' | 'published' | 'archived'
  >('pending');
  const [kind, setKind] = useState<'all' | 'review' | 'suggestion'>('all');

  const { data: feedbackData, isLoading: isFeedbackLoading } =
    useQuery<AdminFeedbackResponse>({
      queryKey: ['admin-feedback', { search, status, kind }],
      queryFn: async () => {
        const response = await api.get<AdminFeedbackResponse>(
          '/admin/feedback',
          {
            params: {
              search: search.trim() || undefined,
              status,
              kind,
              limit: 200
            }
          }
        );
        return response.data;
      },
      enabled: activeTab === 'feedback'
    });

  const updateFeedbackMutation = useMutation({
    mutationFn: ({
      id,
      nextStatus
    }: {
      id: string;
      nextStatus: 'pending' | 'published' | 'archived';
    }) => api.patch(`/admin/feedback/${id}`, { status: nextStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-feedback'] });
    }
  });

  const feedbackItems = feedbackData?.data ?? [];
  const quickCounts = useMemo(() => {
    const counts = {
      pending: 0,
      published: 0,
      archived: 0
    };

    for (const item of feedbackItems) {
      if (item.status && item.status in counts) {
        counts[item.status as keyof typeof counts] += 1;
      }
    }

    return counts;
  }, [feedbackItems]);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-xl font-semibold">Platform Settings</h2>
        <p className="text-sm text-muted">
          Manage global configuration and admin credentials.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
            activeTab === 'general'
              ? 'bg-neonCyan/20 text-neonCyan'
              : 'bg-card/70 text-foreground/75 hover:text-foreground'
          }`}
        >
          General
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('feedback')}
          className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition ${
            activeTab === 'feedback'
              ? 'bg-neonCyan/20 text-neonCyan'
              : 'bg-card/70 text-foreground/75 hover:text-foreground'
          }`}
        >
          Feedback & Reviews
        </button>
      </div>

      {activeTab === 'general' ? (
        <form className="neon-border space-y-4 rounded-lg bg-card/90 p-6">
          <div className="space-y-2">
            <label
              htmlFor="admin-support-email"
              className="text-sm font-medium"
            >
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
      ) : (
        <section className="neon-border space-y-4 rounded-lg bg-card/90 p-6">
          <header className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Moderate user feedback
              </h3>
              <p className="text-sm text-muted-foreground">
                Publish high-quality reviews or archive low-signal suggestions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-yellow-500/10 px-3 py-1 font-semibold text-yellow-300">
                Pending: {quickCounts.pending}
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-semibold text-emerald-300">
                Published: {quickCounts.published}
              </span>
              <span className="rounded-full bg-slate-500/20 px-3 py-1 font-semibold text-slate-300">
                Archived: {quickCounts.archived}
              </span>
            </div>
          </header>

          <div className="grid gap-2 md:grid-cols-3">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search message, name, email"
              className="rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
            />
            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as
                    | 'all'
                    | 'pending'
                    | 'published'
                    | 'archived'
                )
              }
              className="rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>
            <select
              value={kind}
              onChange={(event) =>
                setKind(event.target.value as 'all' | 'review' | 'suggestion')
              }
              className="rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground"
            >
              <option value="all">All types</option>
              <option value="review">Reviews</option>
              <option value="suggestion">Suggestions</option>
            </select>
          </div>

          <div className="space-y-3">
            {isFeedbackLoading ? (
              <p className="text-sm text-muted-foreground">
                Loading feedback...
              </p>
            ) : feedbackItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No feedback found.
              </p>
            ) : (
              feedbackItems.map((item) => (
                <article
                  key={item._id}
                  className="rounded-lg border border-border/70 bg-card/80 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {item.name}{' '}
                        <span className="text-xs font-normal text-muted-foreground">
                          {item.email ? `(${item.email})` : '(anonymous)'}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.kind === 'review' ? 'Review' : 'Suggestion'}
                        {item.rating ? ` • ${item.rating}/5` : ''} •{' '}
                        {new Date(item.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                        item.status === 'published'
                          ? 'bg-emerald-500/10 text-emerald-300'
                          : item.status === 'archived'
                            ? 'bg-slate-500/20 text-slate-300'
                            : 'bg-yellow-500/10 text-yellow-300'
                      }`}
                    >
                      {item.status ?? 'pending'}
                    </span>
                  </div>

                  <p className="mt-3 text-sm text-foreground/85">
                    {item.message}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        updateFeedbackMutation.mutate({
                          id: item._id,
                          nextStatus: 'published'
                        })
                      }
                      disabled={
                        updateFeedbackMutation.isPending ||
                        item.status === 'published'
                      }
                      className="rounded bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-50"
                    >
                      Publish
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateFeedbackMutation.mutate({
                          id: item._id,
                          nextStatus: 'pending'
                        })
                      }
                      disabled={
                        updateFeedbackMutation.isPending ||
                        item.status === 'pending'
                      }
                      className="rounded bg-yellow-500/10 px-3 py-1.5 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-500/20 disabled:opacity-50"
                    >
                      Move to pending
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateFeedbackMutation.mutate({
                          id: item._id,
                          nextStatus: 'archived'
                        })
                      }
                      disabled={
                        updateFeedbackMutation.isPending ||
                        item.status === 'archived'
                      }
                      className="rounded bg-slate-500/20 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-500/30 disabled:opacity-50"
                    >
                      Archive
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}
    </section>
  );
};

export default AdminSettingsPage;
