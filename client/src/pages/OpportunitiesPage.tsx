import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import api from "../lib/axios";
import useAuthStore from "../store/useAuthStore";
import { useToast } from "../components/atoms/Toast";
import { TrainingOpportunitiesCarousel } from "../components/organisms/TrainingOpportunitiesCarousel";
import type { Opportunity } from "../types";

type CreateOpportunityPayload = Pick<Opportunity, "title" | "company" | "description" | "type"> & {
  applyUrl?: string;
  location?: string;
  salary?: string;
  skills?: string[];
};

const ROADMAP_SECTIONS = [
  {
    title: "Engineering Launchpads",
    description: "Pick a technical journey and follow curated milestones from roadmap.sh.",
  accent: "from-neonCyan/20 via-blue-500/10 to-transparent",
    roadmaps: [
      { label: "Frontend Developer", slug: "frontend" },
      { label: "Backend Developer", slug: "backend" },
      { label: "DevOps Engineer", slug: "devops" }
    ]
  },
  {
    title: "Data & AI Paths",
    description: "Grow analytics and machine learning expertise step-by-step.",
    accent: "from-neonMagenta/20 via-purple-500/10 to-transparent",
    roadmaps: [
      { label: "Data Analyst", slug: "data-analyst" },
      { label: "Data Engineer", slug: "data-engineer" },
      { label: "Machine Learning Engineer", slug: "machine-learning-engineer" }
    ]
  },
  {
    title: "Emerging Career Tracks",
    description: "Explore product, security, and mobile roadmaps to stay versatile.",
    accent: "from-amber-400/20 via-pink-500/10 to-transparent",
    roadmaps: [
      { label: "Product Manager", slug: "product-manager" },
      { label: "Cyber Security", slug: "cyber-security" },
      { label: "Android Developer", slug: "android" }
    ]
  }
] as const;

const OpportunitiesPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<Opportunity[]>({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const res = await api.get('/opportunities');
      return res.data;
    }
  });

  const { token, user } = useAuthStore();
  const { push } = useToast();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<Opportunity["type"]>('Internship');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const mutation = useMutation({
    mutationFn: (payload: CreateOpportunityPayload) => api.post('/opportunities', payload),
    onSuccess: () => {
      push({ message: 'Opportunity created', type: 'success' });
      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      setTitle('');
      setCompany('');
      setDescription('');
      setType('Internship');
    },
    onError: () => push({ message: 'Failed to create', type: 'error' })
  });

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Opportunities</h2>
        <p className="text-sm text-muted">Browse internships, training courses, and job openings</p>
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
              Stay motivated with colorful milestone guides pulled straight from roadmap.sh
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
                  <h4 className="text-lg font-semibold text-white">{section.title}</h4>
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
        <h3 className="text-xl font-semibold mb-4">Job & Internship Opportunities</h3>
        
        {user?.role === 'admin' && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // simple client-side validation
              const nextErrors: { title?: string; description?: string } = {};
              if (!title || title.trim().length === 0) nextErrors.title = 'Title is required';
              if (!description || description.trim().length === 0) nextErrors.description = 'Description is required';
              setErrors(nextErrors);
              if (Object.keys(nextErrors).length > 0) return push({ message: 'Please fix form errors', type: 'error' });

              mutation.mutate({ title, company, description, type });
            }}
            className="neon-border rounded-lg bg-surface/80 p-4 mb-4"
          >
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="p-2 w-full bg-white/5 rounded" />
                {errors.title && <p className="text-xs text-red-400">{errors.title}</p>}
              </div>
              <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Company" className="p-2 bg-white/5 rounded" />
              <div className="col-span-2">
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="w-full col-span-2 p-2 bg-white/5 rounded" />
                {errors.description && <p className="text-xs text-red-400">{errors.description}</p>}
              </div>
              <select value={type} onChange={(e) => setType(e.target.value as Opportunity["type"])} className="p-2 bg-white/5 rounded">
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
              </select>
              <button type="submit" className="neon-border rounded px-4 py-2 text-sm font-semibold text-white">Create</button>
            </div>
          </form>
        )}

        <div className="grid gap-4">
          {isLoading ? (
            <p className="text-sm text-muted">Loading...</p>
          ) : (
            (data || []).map((opp) => (
              <article key={opp._id} className="neon-border rounded-lg bg-surface/80 p-4">
                <h3 className="text-lg font-semibold text-neonCyan">{opp.title}</h3>
                <p className="text-sm text-muted">{opp.company} • {opp.type}</p>
                <p className="mt-2 text-sm text-white/80">{opp.description}</p>
                {opp.skills && opp.skills.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {opp.skills.map((skill) => (
                      <span key={skill} className="rounded bg-white/10 px-2 py-1 text-xs uppercase tracking-wide text-neonCyan">
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                {(opp.location || opp.salary) && (
                  <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted">
                    {opp.location && (
                      <div>
                        <dt className="font-semibold text-white/70">Location</dt>
                        <dd>{opp.location}</dd>
                      </div>
                    )}
                    {opp.salary && (
                      <div>
                        <dt className="font-semibold text-white/70">Salary</dt>
                        <dd>{opp.salary}</dd>
                      </div>
                    )}
                  </dl>
                )}
                <div className="mt-4 flex gap-3">
                  {opp.applyUrl && (
                    <a
                      href={opp.applyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded border border-white/10 px-4 py-2 text-sm text-muted"
                    >
                      External Link
                    </a>
                  )}
                  <ApplyButton oppId={opp._id} token={token} />
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
};

export default OpportunitiesPage;

const ApplyButton = ({ oppId, token }: { oppId: string; token?: string | null }) => {
  const [loading, setLoading] = useState(false);
  const { push } = useToast();

  const onApply = async () => {
    if (!token) return push({ message: 'Login to apply', type: 'error' });
    try {
      setLoading(true);
      await api.post(`/opportunities/${oppId}/apply`);
      push({ message: 'Applied', type: 'success' });
    } catch (err) {
      push({ message: 'Apply failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={onApply} disabled={!token || loading} title={!token ? 'Login to apply' : undefined} className="neon-border rounded px-4 py-2 text-sm font-semibold text-white">
      {loading ? 'Applying...' : 'Apply'}
    </button>
  );
};
