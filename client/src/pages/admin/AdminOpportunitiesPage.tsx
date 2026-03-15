import { useDeferredValue, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';

type OpportunityStatus = 'pending' | 'approved' | 'rejected';

interface AdminOpportunity {
  _id: string;
  title: string;
  company: string;
  status: OpportunityStatus;
  createdAt: string;
  applicantsCount: number;
  type: string;
  postedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

interface AdminOpportunityResponse {
  data: AdminOpportunity[];
  total: number;
}

interface AdminTraining {
  _id: string;
  title: string;
  description: string;
  provider: string;
  duration: number;
  startDate: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  rating?: number;
  skills?: string[];
  price?: number;
  url?: string;
}

interface AdminTrainingResponse {
  data: AdminTraining[];
  total: number;
}

const statusOptions: Array<{
  label: string;
  value: 'all' | OpportunityStatus;
}> = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'All', value: 'all' }
];

const AdminOpportunitiesPage = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [status, setStatus] =
    useState<(typeof statusOptions)[number]['value']>('pending');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [editingTrainingId, setEditingTrainingId] = useState<string | null>(
    null
  );
  const [trainingForm, setTrainingForm] = useState({
    title: '',
    description: '',
    provider: '',
    duration: 8,
    startDate: '',
    level: 'intermediate' as 'beginner' | 'intermediate' | 'advanced',
    rating: 4.5,
    skillsCsv: '',
    price: '',
    url: ''
  });

  const { data, isLoading, isFetching } = useQuery<AdminOpportunityResponse>({
    queryKey: ['admin-opportunities', { search: deferredSearch, status }],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (deferredSearch.trim()) params.search = deferredSearch.trim();
      if (status !== 'all') params.status = status;
      const response = await api.get<AdminOpportunityResponse>(
        '/admin/opportunities',
        { params }
      );
      return response.data;
    }
  });

  const opportunities = data?.data ?? [];

  const { data: trainingData, isLoading: trainingLoading } =
    useQuery<AdminTrainingResponse>({
      queryKey: ['admin-trainings'],
      queryFn: async () => {
        const response =
          await api.get<AdminTrainingResponse>('/trainings/admin');
        return response.data;
      }
    });

  const trainings = trainingData?.data ?? [];

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/opportunities/${id}/approve`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-opportunities'] });
      setFeedback('Opportunity approved.');
      setErrorMessage(null);
    },
    onError: () => {
      setErrorMessage('Could not approve opportunity.');
      setFeedback(null);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/opportunities/${id}/reject`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-opportunities'] });
      setFeedback('Opportunity rejected.');
      setErrorMessage(null);
    },
    onError: () => {
      setErrorMessage('Could not reject opportunity.');
      setFeedback(null);
    }
  });

  const busy = approveMutation.isPending || rejectMutation.isPending;

  const createTrainingMutation = useMutation({
    mutationFn: (payload: Omit<AdminTraining, '_id'>) =>
      api.post('/trainings/admin', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainings'] });
      setFeedback('Training created.');
      setErrorMessage(null);
      setEditingTrainingId(null);
      setTrainingForm({
        title: '',
        description: '',
        provider: '',
        duration: 8,
        startDate: '',
        level: 'intermediate',
        rating: 4.5,
        skillsCsv: '',
        price: '',
        url: ''
      });
    },
    onError: () => {
      setErrorMessage('Could not create training.');
      setFeedback(null);
    }
  });

  const updateTrainingMutation = useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: Partial<AdminTraining>;
    }) => api.put(`/trainings/admin/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainings'] });
      setFeedback('Training updated.');
      setErrorMessage(null);
      setEditingTrainingId(null);
    },
    onError: () => {
      setErrorMessage('Could not update training.');
      setFeedback(null);
    }
  });

  const deleteTrainingMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/trainings/admin/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-trainings'] });
      setFeedback('Training deleted.');
      setErrorMessage(null);
      if (editingTrainingId) {
        setEditingTrainingId(null);
      }
    },
    onError: () => {
      setErrorMessage('Could not delete training.');
      setFeedback(null);
    }
  });

  const normalizeTrainingPayload = () => {
    const parsedPrice = trainingForm.price.trim()
      ? Number(trainingForm.price)
      : undefined;
    return {
      title: trainingForm.title.trim(),
      description: trainingForm.description.trim(),
      provider: trainingForm.provider.trim(),
      duration: Number(trainingForm.duration),
      startDate: trainingForm.startDate,
      level: trainingForm.level,
      rating: Number(trainingForm.rating),
      skills: trainingForm.skillsCsv
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean),
      ...(parsedPrice !== undefined ? { price: parsedPrice } : {}),
      ...(trainingForm.url.trim() ? { url: trainingForm.url.trim() } : {})
    };
  };

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Approve Opportunities</h2>
          <p className="text-sm text-muted">
            Approve or reject user-submitted job posts.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {opportunities.length} records shown • {status.toUpperCase()} view
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            className="w-72 rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-sidebar-active focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-active/50"
            placeholder="Search by title, company, or keywords"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select
            className="rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground focus:border-sidebar-active focus:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-active/50"
            value={status}
            onChange={(event) => setStatus(event.target.value as typeof status)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </header>

      {(feedback || errorMessage) && (
        <div className="neon-border rounded border border-border/70 bg-card/70 px-4 py-3 text-xs text-muted-foreground">
          {feedback && <span className="text-green-300">{feedback}</span>}
          {errorMessage && <span className="text-red-300">{errorMessage}</span>}
        </div>
      )}

      <div className="grid gap-4">
        {isLoading || isFetching ? (
          [...Array(4)].map((_, index) => (
            <article
              key={index}
              className="neon-border animate-pulse rounded-lg bg-card/75 p-5"
            >
              <div className="h-4 w-1/3 rounded bg-white/10" />
              <div className="mt-3 h-3 w-2/3 rounded bg-white/10" />
              <div className="mt-2 h-3 w-1/4 rounded bg-white/10" />
            </article>
          ))
        ) : opportunities.length === 0 ? (
          <div className="neon-border rounded-lg bg-card/90 p-6 text-center text-sm text-white/60">
            No opportunities match the current filters.
          </div>
        ) : (
          opportunities.map((opportunity) => (
            <article
              key={opportunity._id}
              className="neon-border rounded-lg bg-card/90 p-5"
            >
              <header className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-lg font-semibold text-neonCyan">
                    {opportunity.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {opportunity.company}
                  </p>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <p>{new Date(opportunity.createdAt).toLocaleDateString()}</p>
                  <p className="mt-1">
                    Submitted by {opportunity.postedBy.name}
                  </p>
                  <p className="mt-1">
                    Applicants: {opportunity.applicantsCount}
                  </p>
                </div>
              </header>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <span className="rounded-full bg-card/80 px-3 py-1 text-foreground/85">
                  {opportunity.type}
                </span>
                <span
                  className={`rounded-full px-3 py-1 font-semibold ${
                    opportunity.status === 'pending'
                      ? 'bg-yellow-500/10 text-yellow-300'
                      : opportunity.status === 'approved'
                        ? 'bg-green-500/10 text-green-300'
                        : 'bg-red-500/10 text-red-300'
                  }`}
                >
                  {opportunity.status.toUpperCase()}
                </span>
                <span className="rounded-full bg-card/80 px-3 py-1 text-muted-foreground">
                  ID: {opportunity._id}
                </span>
              </div>

              <footer className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-muted-foreground">
                  Contact: {opportunity.postedBy.email}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded bg-green-500/10 px-4 py-2 text-xs font-semibold text-green-300 transition hover:bg-green-500/20 focus-visible:ring-2 focus-visible:ring-sidebar-active/50 disabled:opacity-50"
                    onClick={() => approveMutation.mutate(opportunity._id)}
                    disabled={busy || opportunity.status === 'approved'}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="rounded bg-red-500/10 px-4 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 focus-visible:ring-2 focus-visible:ring-sidebar-active/50 disabled:opacity-50"
                    onClick={() => rejectMutation.mutate(opportunity._id)}
                    disabled={busy || opportunity.status === 'rejected'}
                  >
                    Reject
                  </button>
                </div>
              </footer>
            </article>
          ))
        )}
      </div>

      <section className="neon-border rounded-lg bg-card/90 p-5">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Trending trainings (CRUD)
            </h3>
            <p className="text-sm text-muted-foreground">
              Create, update, and remove training cards shown in
              recommendations.
            </p>
          </div>
          <span className="rounded-full bg-card/80 px-3 py-1 text-xs text-muted-foreground">
            {trainingData?.total ?? trainings.length} total
          </span>
        </header>

        <form
          className="grid gap-2 md:grid-cols-2"
          onSubmit={(event) => {
            event.preventDefault();
            const payload = normalizeTrainingPayload();
            if (
              !payload.title ||
              !payload.description ||
              !payload.provider ||
              !payload.startDate
            ) {
              setErrorMessage(
                'Training title, description, provider, and start date are required.'
              );
              setFeedback(null);
              return;
            }

            if (editingTrainingId) {
              updateTrainingMutation.mutate({ id: editingTrainingId, payload });
              return;
            }

            createTrainingMutation.mutate(payload);
          }}
        >
          <input
            value={trainingForm.title}
            onChange={(event) =>
              setTrainingForm((current) => ({
                ...current,
                title: event.target.value
              }))
            }
            placeholder="Training title"
            className="rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground"
          />
          <input
            value={trainingForm.provider}
            onChange={(event) =>
              setTrainingForm((current) => ({
                ...current,
                provider: event.target.value
              }))
            }
            placeholder="Provider (Udemy, Coursera...)"
            className="rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground"
          />
          <textarea
            value={trainingForm.description}
            onChange={(event) =>
              setTrainingForm((current) => ({
                ...current,
                description: event.target.value
              }))
            }
            placeholder="Description"
            className="md:col-span-2 min-h-[92px] rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground"
          />
          <input
            type="date"
            value={trainingForm.startDate}
            onChange={(event) =>
              setTrainingForm((current) => ({
                ...current,
                startDate: event.target.value
              }))
            }
            className="rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground"
          />
          <input
            type="number"
            value={trainingForm.duration}
            onChange={(event) =>
              setTrainingForm((current) => ({
                ...current,
                duration: Number(event.target.value)
              }))
            }
            min={1}
            placeholder="Duration (hours)"
            className="rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground"
          />
          <select
            value={trainingForm.level}
            onChange={(event) =>
              setTrainingForm((current) => ({
                ...current,
                level: event.target.value as
                  | 'beginner'
                  | 'intermediate'
                  | 'advanced'
              }))
            }
            className="rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground"
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <input
            type="number"
            value={trainingForm.rating}
            onChange={(event) =>
              setTrainingForm((current) => ({
                ...current,
                rating: Number(event.target.value)
              }))
            }
            min={1}
            max={5}
            step={0.1}
            placeholder="Rating (1-5)"
            className="rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground"
          />
          <input
            value={trainingForm.skillsCsv}
            onChange={(event) =>
              setTrainingForm((current) => ({
                ...current,
                skillsCsv: event.target.value
              }))
            }
            placeholder="Skills (comma-separated)"
            className="rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground"
          />
          <input
            value={trainingForm.price}
            onChange={(event) =>
              setTrainingForm((current) => ({
                ...current,
                price: event.target.value
              }))
            }
            placeholder="Price (optional)"
            className="rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground"
          />
          <input
            value={trainingForm.url}
            onChange={(event) =>
              setTrainingForm((current) => ({
                ...current,
                url: event.target.value
              }))
            }
            placeholder="Course URL (optional)"
            className="md:col-span-2 rounded border border-border/70 bg-card/80 px-3 py-2 text-sm text-foreground"
          />
          <div className="md:col-span-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={
                createTrainingMutation.isPending ||
                updateTrainingMutation.isPending
              }
              className="rounded bg-neonCyan/15 px-4 py-2 text-sm font-semibold text-neonCyan transition hover:bg-neonCyan/25 disabled:opacity-50"
            >
              {editingTrainingId ? 'Update training' : 'Create training'}
            </button>
            {editingTrainingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingTrainingId(null);
                  setTrainingForm({
                    title: '',
                    description: '',
                    provider: '',
                    duration: 8,
                    startDate: '',
                    level: 'intermediate',
                    rating: 4.5,
                    skillsCsv: '',
                    price: '',
                    url: ''
                  });
                }}
                className="rounded bg-slate-500/20 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-slate-500/30"
              >
                Cancel edit
              </button>
            )}
          </div>
        </form>

        <div className="mt-5 grid gap-3">
          {trainingLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading trainings...
            </p>
          ) : trainings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No trainings added yet.
            </p>
          ) : (
            trainings.map((training) => (
              <article
                key={training._id}
                className="rounded-lg border border-border/70 bg-card/80 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h4 className="text-base font-semibold text-neonCyan">
                      {training.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {training.provider} • {training.level} •{' '}
                      {training.duration}h •{' '}
                      {new Date(training.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTrainingId(training._id);
                        setTrainingForm({
                          title: training.title,
                          description: training.description,
                          provider: training.provider,
                          duration: training.duration,
                          startDate: training.startDate.slice(0, 10),
                          level: training.level,
                          rating: training.rating ?? 4.5,
                          skillsCsv: (training.skills ?? []).join(', '),
                          price:
                            training.price !== undefined
                              ? String(training.price)
                              : '',
                          url: training.url ?? ''
                        });
                      }}
                      className="rounded bg-neonCyan/15 px-3 py-1.5 text-xs font-semibold text-neonCyan transition hover:bg-neonCyan/25"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        deleteTrainingMutation.mutate(training._id)
                      }
                      disabled={deleteTrainingMutation.isPending}
                      className="rounded bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p className="mt-2 text-sm text-foreground/85">
                  {training.description}
                </p>
                {(training.skills ?? []).length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(training.skills ?? []).slice(0, 6).map((skill) => (
                      <span
                        key={`${training._id}-${skill}`}
                        className="rounded bg-card/90 px-2 py-1 text-[11px] uppercase tracking-wide text-neonCyan"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  );
};

export default AdminOpportunitiesPage;
