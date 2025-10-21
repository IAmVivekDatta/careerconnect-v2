import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import useAuthStore from "../store/useAuthStore";
import { useToast } from "../components/atoms/Toast";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { TrainingOpportunitiesCarousel } from "../components/organisms/TrainingOpportunitiesCarousel";

const OpportunitiesPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["opportunities"],
    queryFn: async () => {
      const res = await api.get('/opportunities');
      return res.data;
    }
  });

  const { token } = useAuthStore();
  const { user } = useAuthStore();
  const { push } = useToast();

  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('Internship');
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  const mutation = useMutation({
    mutationFn: (payload: any) => api.post('/opportunities', payload),
    onSuccess: () => {
      push({ message: 'Opportunity created', type: 'success' });
      // Simple cache invalidation
      // @ts-ignore
      window.location.reload();
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
              <select value={type} onChange={(e) => setType(e.target.value)} className="p-2 bg-white/5 rounded">
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
            (data || []).map((opp: any) => (
              <article key={opp._id} className="neon-border rounded-lg bg-surface/80 p-4">
                <h3 className="text-lg font-semibold text-neonCyan">{opp.title}</h3>
                <p className="text-sm text-muted">{opp.company} • {opp.type}</p>
                <p className="mt-2 text-sm text-white/80">{opp.description}</p>
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
