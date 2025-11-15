import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../lib/axios";
import useAuthStore from "../store/useAuthStore";
import { useToast } from "../components/atoms/Toast";
import type { Opportunity } from "../types";

const OpportunityDetailPage = () => {
  const { id } = useParams();
  const { token } = useAuthStore();

  const { data, isLoading } = useQuery<Opportunity>({
    queryKey: ["opportunity", id],
    queryFn: async () => {
      const res = await api.get(`/opportunities/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  if (isLoading) return <p>Loading...</p>;

  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const onApply = async () => {
    if (!token) return push({ message: 'Please login to apply', type: 'error' });
    try {
      setLoading(true);
      let resumeUrl: string | undefined;
      if (resumeFile) {
        const fd = new FormData();
        fd.append('file', resumeFile);
        const uploadRes = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        resumeUrl = uploadRes.data.url;
      }
      await api.post(`/opportunities/${id}/apply`, { resumeUrl });
      push({ message: 'Applied', type: 'success' });
    } catch (err) {
      push({ message: 'Apply failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold text-neonCyan">{data?.title}</h2>
        <p className="text-sm text-muted">Company: {data?.company}</p>
      </header>
      <article className="neon-border rounded-lg bg-surface/80 p-6">
        <p className="text-sm text-white/80">{data?.description}</p>
        {data?.skills && data.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span key={skill} className="rounded bg-white/10 px-2 py-1 text-xs uppercase tracking-wide text-neonCyan">
                {skill}
              </span>
            ))}
          </div>
        )}
        {(data?.location || data?.salary) && (
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted">
            {data.location && (
              <div>
                <dt className="font-semibold text-white/80">Location</dt>
                <dd>{data.location}</dd>
              </div>
            )}
            {data.salary && (
              <div>
                <dt className="font-semibold text-white/80">Salary</dt>
                <dd>{data.salary}</dd>
              </div>
            )}
          </dl>
        )}
        <div className="mt-4">
          <div className="mb-2">
            <label htmlFor="opportunity-resume" className="text-sm text-muted">Attach resume (optional)</label>
            <input
              id="opportunity-resume"
              name="resume"
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <button onClick={onApply} disabled={loading} className="neon-border rounded px-4 py-2 text-sm font-semibold text-white">
            {loading ? 'Applying...' : 'Apply'}
          </button>
        </div>
      </article>
    </section>
  );
};

export default OpportunityDetailPage;
