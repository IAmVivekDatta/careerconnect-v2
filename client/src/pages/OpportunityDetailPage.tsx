import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import { useToast } from '../components/atoms/Toast';
import type { Opportunity } from '../types';

const OpportunityDetailPage = () => {
  const { id } = useParams();
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<Opportunity>({
    queryKey: ['opportunity', id],
    queryFn: async () => {
      const res = await api.get(`/opportunities/${id}`);
      return res.data;
    },
    enabled: !!id
  });

  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [applied, setApplied] = useState(false);

  const hasApplied = useMemo(
    () => applied || Boolean(data?.hasApplied),
    [applied, data?.hasApplied]
  );

  if (isLoading) return <p>Loading...</p>;

  const onApply = async () => {
    if (hasApplied) {
      push({
        message: 'You already applied for this opportunity',
        type: 'success'
      });
      return;
    }
    if (!token)
      return push({ message: 'Please login to apply', type: 'error' });
    try {
      setLoading(true);
      let resumeUrl: string | undefined;
      if (resumeFile) {
        const fd = new FormData();
        fd.append('file', resumeFile);
        const uploadRes = await api.post('/upload', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        resumeUrl = uploadRes.data.url;
      }
      await api.post(`/opportunities/${id}/apply`, { resumeUrl });
      push({ message: 'Applied', type: 'success' });
      setApplied(true);
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunity', id] });
    } catch (err) {
      const maybeStatus = (err as { response?: { status?: number } })?.response
        ?.status;
      if (maybeStatus === 409) {
        setApplied(true);
        push({
          message: 'You already applied for this opportunity',
          type: 'success'
        });
        return;
      }
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
        <p className="text-xs text-muted-foreground">Status: {data?.status}</p>
      </header>
      <article className="neon-border rounded-lg bg-surface/80 p-6">
        <p className="text-sm text-white/80">{data?.description}</p>
        {data?.skills && data.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {data.skills.map((skill) => (
              <span
                key={skill}
                className="rounded bg-white/10 px-2 py-1 text-xs uppercase tracking-wide text-neonCyan"
              >
                {skill}
              </span>
            ))}
          </div>
        )}
        {(data?.location || data?.salary) && (
          <dl className="mt-4 grid grid-cols-2 gap-2 text-sm text-foreground/85">
            {data.location && (
              <div>
                <dt className="font-semibold text-foreground">Location</dt>
                <dd>{data.location}</dd>
              </div>
            )}
            {data.salary && (
              <div>
                <dt className="font-semibold text-foreground">
                  Stipend / Salary
                </dt>
                <dd>{data.salary}</dd>
              </div>
            )}
          </dl>
        )}
        {data?.applyUrl && (
          <a
            href={data.applyUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex rounded border border-white/20 px-4 py-2 text-sm font-semibold text-foreground/90 hover:text-neonCyan"
          >
            External Application Link
          </a>
        )}
        <div className="mt-4">
          <div className="mb-2">
            <label htmlFor="opportunity-resume" className="text-sm text-muted">
              Attach resume (optional)
            </label>
            <input
              id="opportunity-resume"
              name="resume"
              type="file"
              accept="application/pdf,image/*"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <button
            onClick={onApply}
            disabled={loading || hasApplied}
            className="neon-border rounded px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Applying...' : hasApplied ? 'Applied' : 'Apply'}
          </button>
        </div>
      </article>
    </section>
  );
};

export default OpportunityDetailPage;
