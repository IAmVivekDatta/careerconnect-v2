import { useEffect, useState } from 'react';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import { useToast } from '../components/atoms/Toast';

const ProfilePage = () => {
  return (
    <section className="space-y-4">
      <header className="neon-border rounded-lg bg-surface/80 p-6">
        <h2 className="text-xl font-semibold">Profile</h2>
        <p className="text-sm text-muted">Showcase your experience and achievements.</p>
      </header>
      <ProfileEditor />
    </section>
  );
};

export default ProfilePage;

const ProfileEditor = () => {
  const { token } = useAuthStore();
  const { push } = useToast();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get('/users/me');
        if (!cancelled) setProfile(res.data);
      } catch (err) {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const onSave = async (e: any) => {
    e.preventDefault();
    if (!token) return push({ message: 'Please login to update profile', type: 'error' });
    setLoading(true);
    try {
      let resumeUrl = profile?.resumeUrl;
      if (resumeFile) {
        const fd = new FormData();
        fd.append('file', resumeFile);
        const uploadRes = await api.post('/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        resumeUrl = uploadRes.data.url;
      }

      const payload = { bio: profile?.bio, resumeUrl };
      const updated = await api.put('/users/me', payload);
      setProfile(updated.data);
      push({ message: 'Profile updated', type: 'success' });
    } catch (err) {
      push({ message: 'Update failed', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) return <p>Loading profile...</p>;

  return (
    <form onSubmit={onSave} className="grid gap-4 lg:grid-cols-2">
      <article className="neon-border rounded-lg bg-surface/80 p-4">
        <h3 className="text-sm font-semibold text-neonCyan">About</h3>
        <textarea value={profile.bio || ''} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} className="w-full p-2" />
      </article>
      <article className="neon-border rounded-lg bg-surface/80 p-4">
        <h3 className="text-sm font-semibold text-neonCyan">Resume</h3>
        <p className="text-sm text-muted">Upload a PDF or image (optional).</p>
        <input type="file" accept="application/pdf,image/*" onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)} />
        {profile.resumeUrl && (
          <p className="text-sm text-muted mt-2">Current resume: <a href={profile.resumeUrl} target="_blank" rel="noreferrer" className="underline">View</a></p>
        )}
        <div className="mt-4">
          <button disabled={loading} type="submit" className="neon-border rounded px-4 py-2 text-sm font-semibold text-white">
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </article>
    </form>
  );
};
