import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import { useToast } from '../components/atoms/Toast';
import { TrainingOpportunitiesCarousel } from '../components/organisms/TrainingOpportunitiesCarousel';
import type { Opportunity } from '../types';

type CreateOpportunityPayload = Pick<
  Opportunity,
  'title' | 'company' | 'description' | 'type'
> & {
  applyUrl?: string;
  location?: string;
  salary?: string;
  skills?: string[];
};

const ROADMAP_SECTIONS = [
  {
    title: 'Engineering Launchpads',
    description:
      'Pick a technical journey and follow curated milestones from roadmap.sh.',
    accent: 'from-neonCyan/20 via-blue-500/10 to-transparent',
    roadmaps: [
      { label: 'Frontend Developer', slug: 'frontend' },
      { label: 'Backend Developer', slug: 'backend' },
      { label: 'DevOps Engineer', slug: 'devops' }
    ]
  },
  {
    title: 'Data & AI Paths',
    description: 'Grow analytics and machine learning expertise step-by-step.',
    accent: 'from-neonMagenta/20 via-purple-500/10 to-transparent',
    roadmaps: [
      { label: 'Data Analyst', slug: 'data-analyst' },
      { label: 'Data Engineer', slug: 'data-engineer' },
      { label: 'Machine Learning Engineer', slug: 'machine-learning-engineer' }
    ]
  },
  {
    title: 'Emerging Career Tracks',
    description:
      'Explore product, security, and mobile roadmaps to stay versatile.',
    accent: 'from-amber-400/20 via-pink-500/10 to-transparent',
    roadmaps: [
      { label: 'Product Manager', slug: 'product-manager' },
      { label: 'Cyber Security', slug: 'cyber-security' },
      { label: 'Android Developer', slug: 'android' }
    ]
  }
] as const;

const OpportunitiesPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<Opportunity[]>({
    queryKey: ['opportunities', 'approved-live'],
    queryFn: async () => {
      const res = await api.get('/opportunities', {
        params: { approved: true, limit: 20 }
      });
      return res.data;
    },
    refetchInterval: 30_000,
    staleTime: 15_000
  });

  const { data: appliedOpportunities = [] } = useQuery<Opportunity[]>({
    queryKey: ['opportunities', 'applied'],
    queryFn: async () => {
      const res = await api.get('/opportunities', {
        params: { applied: true, limit: 20 }
      });
      return res.data;
    }
  });

  const { token, user } = useAuthStore();
  const { push } = useToast();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Opportunity['type']>('Internship');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [applyUrl, setApplyUrl] = useState('');
  const [skillsCsv, setSkillsCsv] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    location?: string;
    salary?: string;
  }>({});

  const opportunities = data ?? [];
  const visibleOpportunities = opportunities.slice(0, visibleCount);
  const hasMore = opportunities.length > visibleCount;

  const lastUpdatedLabel = useMemo(() => {
    if (!opportunities[0]?.createdAt)
      return 'Real-time updates every 30 seconds';
    return 'Real-time updates every 30 seconds';
  }, [opportunities]);

  const mutation = useMutation({
    mutationFn: (payload: CreateOpportunityPayload) =>
      api.post('/opportunities', payload),
    onSuccess: () => {
      push({ message: 'Opportunity created', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      setTitle('');
      setCompany('');
      setDescription('');
      setType('Internship');
      setLocation('');
      setSalary('');
      setApplyUrl('');
      setSkillsCsv('');
    },
    onError: () => push({ message: 'Failed to create', type: 'error' })
  });

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Opportunities</h2>
        <p className="text-sm text-muted">
          Browse internships, training courses, and job openings
        </p>
      </header>

      {/* Training Opportunities Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Recommended Trainings</h3>
        <TrainingOpportunitiesCarousel />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold">Career Roadmaps</h3>
            <p className="text-sm text-muted">
              Stay motivated with colorful milestone guides pulled straight from
              roadmap.sh
            </p>
          </div>
          <a
            href="https://roadmap.sh"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-neonCyan/40 bg-neonCyan/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neonCyan transition hover:bg-neonCyan/20"
          >
            Explore all roadmaps
            <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {ROADMAP_SECTIONS.map((section) => (
            <article
              key={section.title}
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-surface/80 p-5 shadow-[0_20px_40px_-24px_rgba(0,0,0,0.6)]"
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${section.accent} opacity-90`}
              />
              <div className="relative space-y-4">
                <header className="space-y-1">
                  <h4 className="text-lg font-semibold text-white">
                    {section.title}
                  </h4>
                  <p className="text-sm text-white/70">{section.description}</p>
                </header>
                <ul className="space-y-3">
                  {section.roadmaps.map((roadmap) => (
                    <li key={roadmap.slug}>
                      <a
                        href={`https://roadmap.sh/${roadmap.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:border-neonCyan/70 hover:bg-neonCyan/10"
                      >
                        <span className="font-medium">{roadmap.label}</span>
                        <ArrowUpRight className="h-4 w-4 text-white/60 transition group-hover:text-neonCyan" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Job Opportunities Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          Job & Internship Opportunities
        </h3>
        <p className="mb-4 text-xs text-muted-foreground">{lastUpdatedLabel}</p>

        {user?.role === 'admin' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const nextErrors: {
                title?: string;
                description?: string;
                location?: string;
                salary?: string;
              } = {};
              if (!title || title.trim().length === 0)
                nextErrors.title = 'Title is required';
              if (!description || description.trim().length === 0)
                nextErrors.description = 'Description is required';
              if (!location || location.trim().length === 0)
                nextErrors.location = 'Location is required';
              if (!salary || salary.trim().length === 0)
                nextErrors.salary = 'Stipend/Salary is required';
              setErrors(nextErrors);
              if (Object.keys(nextErrors).length > 0)
                return push({
                  message: 'Please fix form errors',
                  type: 'error'
                });

              mutation.mutate({
                title,
                company,
                description,
                type,
                location,
                salary,
                applyUrl: applyUrl.trim() || undefined,
                skills: skillsCsv
                  .split(',')
                  .map((skill) => skill.trim())
                  .filter(Boolean)
              });
            }}
            className="neon-border rounded-lg bg-surface/80 p-4 mb-4"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <input
                  name="opportunityTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Title"
                  className="p-2 w-full bg-white/5 rounded"
                />
                {errors.title && (
                  <p className="text-xs text-red-400">{errors.title}</p>
                )}
              </div>
              <input
                name="opportunityCompany"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company"
                className="p-2 bg-white/5 rounded"
              />
              <div>
                <input
                  name="opportunityLocation"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location (required)"
                  className="p-2 w-full bg-white/5 rounded"
                />
                {errors.location && (
                  <p className="text-xs text-red-400">{errors.location}</p>
                )}
              </div>
              <div>
                <input
                  name="opportunitySalary"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="Stipend or Salary (required)"
                  className="p-2 w-full bg-white/5 rounded"
                />
                {errors.salary && (
                  <p className="text-xs text-red-400">{errors.salary}</p>
                )}
              </div>
              <div className="col-span-2">
                <textarea
                  name="opportunityDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Description"
                  className="w-full col-span-2 p-2 bg-white/5 rounded"
                />
                {errors.description && (
                  <p className="text-xs text-red-400">{errors.description}</p>
                )}
              </div>
              <input
                name="opportunityApplyUrl"
                value={applyUrl}
                onChange={(e) => setApplyUrl(e.target.value)}
                placeholder="External apply URL (optional)"
                className="p-2 bg-white/5 rounded"
              />
              <input
                name="opportunitySkills"
                value={skillsCsv}
                onChange={(e) => setSkillsCsv(e.target.value)}
                placeholder="Required skills (comma-separated)"
                className="p-2 bg-white/5 rounded"
              />
              <select
                name="opportunityType"
                value={type}
                onChange={(e) => setType(e.target.value as Opportunity['type'])}
                className="p-2 bg-white/5 rounded"
              >
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Training">Training</option>
              </select>
              <button
                type="submit"
                className="neon-border rounded px-4 py-2 text-sm font-semibold text-white"
              >
                Create
              </button>
            </div>
          </form>
        )}

        {user && appliedOpportunities.length > 0 && (
          <section className="mb-6 rounded-lg border border-border/70 bg-card/80 p-4">
            <h4 className="text-base font-semibold text-foreground">
              Applied opportunities
            </h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Track roles you already applied for and their current status.
            </p>
            <div className="mt-3 grid gap-2">
              {appliedOpportunities.map((opp) => (
                <div
                  key={`applied-${opp._id}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded border border-border/60 bg-card/70 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {opp.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {opp.company}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                        opp.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-300'
                          : opp.status === 'rejected'
                            ? 'bg-red-500/10 text-red-300'
                            : 'bg-yellow-500/10 text-yellow-300'
                      }`}
                    >
                      {opp.status}
                    </span>
                    <Link
                      to={`/opportunity/${opp._id}`}
                      className="text-xs font-semibold text-neonCyan hover:text-neonCyan/80"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-4">
          {isLoading ? (
            <p className="text-sm text-muted">Loading...</p>
          ) : (
            visibleOpportunities.map((opp) => (
              <article
                key={opp._id}
                className="neon-border rounded-lg bg-surface/80 p-4"
              >
                <h3 className="text-lg font-semibold text-neonCyan">
                  {opp.title}
                </h3>
                <p className="text-sm text-muted">
                  {opp.company} • {opp.type}
                </p>
                <p className="mt-2 text-sm text-white/80">{opp.description}</p>
                {opp.skills && opp.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {opp.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded bg-white/10 px-2 py-1 text-xs uppercase tracking-wide text-neonCyan"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                {(opp.location || opp.salary) && (
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-foreground/80">
                    {opp.location && (
                      <div>
                        <dt className="font-semibold text-foreground">
                          Location
                        </dt>
                        <dd>{opp.location}</dd>
                      </div>
                    )}
                    {opp.salary && (
                      <div>
                        <dt className="font-semibold text-foreground">
                          Stipend / Salary
                        </dt>
                        <dd>{opp.salary}</dd>
                      </div>
                    )}
                  </dl>
                )}
                <div className="mt-2 text-xs text-muted-foreground">
                  Status: {opp.status}
                </div>
                <div className="mt-4 flex gap-3">
                  {opp.applyUrl && (
                    <a
                      href={opp.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-white/10 px-4 py-2 text-sm text-foreground/85 hover:text-neonCyan"
                    >
                      External Application Link
                    </a>
                  )}
                  <ApplyButton
                    oppId={opp._id}
                    token={token}
                    hasApplied={Boolean(opp.hasApplied)}
                    onApplied={() => {
                      queryClient.invalidateQueries({
                        queryKey: ['opportunities']
                      });
                    }}
                  />
                  <Link
                    to={`/opportunity/${opp._id}`}
                    className="rounded border border-neonCyan/40 px-4 py-2 text-sm font-semibold text-neonCyan transition hover:border-neonCyan"
                  >
                    Details
                  </Link>
                </div>
              </article>
            ))
          )}

          {!isLoading && visibleOpportunities.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No approved opportunities are available right now.
            </p>
          )}

          {!isLoading && hasMore && (
            <button
              type="button"
              onClick={() => setVisibleCount((count) => count + 6)}
              className="mx-auto rounded-full border border-neonCyan/40 px-5 py-2 text-sm font-semibold text-neonCyan transition hover:border-neonCyan"
            >
              Load more jobs
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default OpportunitiesPage;

const ApplyButton = ({
  oppId,
  token,
  hasApplied,
  onApplied
}: {
  oppId: string;
  token?: string | null;
  hasApplied: boolean;
  onApplied: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  const onApply = async () => {
    if (hasApplied) {
      push({ message: 'You already applied for this role', type: 'success' });
      return;
    }
    if (!token) return push({ message: 'Login to apply', type: 'error' });
    try {
      setLoading(true);
      await api.post(`/opportunities/${oppId}/apply`);
      push({ message: 'Applied', type: 'success' });
      onApplied();
    } catch (err) {
      const maybeStatus = (err as { response?: { status?: number } })?.response
        ?.status;
      if (maybeStatus === 409) {
        push({ message: 'You already applied for this role', type: 'success' });
        onApplied();
        return;
      }
      push({ message: 'Apply failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={onApply}
      disabled={!token || loading || hasApplied}
      title={!token ? 'Login to apply' : undefined}
      className="neon-border rounded px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
    >
      {loading ? 'Applying...' : hasApplied ? 'Applied' : 'Apply'}
    </button>
  );
};
