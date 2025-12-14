import { useDeferredValue, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import RecommendedAlumniCarousel from '../components/organisms/RecommendedAlumniCarousel';
import api from '../lib/axios';
import { useToast } from '../components/atoms/Toast';
import { ConnectionsOverview, ConnectionUser } from '../types';

interface AlumniRecord extends ConnectionUser {
  experience?: Array<{ title?: string; company?: string }>;
}

interface AlumniDirectoryResponse {
  data: AlumniRecord[];
}

const uniqueSkills = (alumni: AlumniRecord[]) => {
  const set = new Set<string>();
  alumni.forEach((person) => {
    person.skills?.forEach((skill) => set.add(skill));
  });
  return Array.from(set).sort((a, b) => a.localeCompare(b));
};

const AlumniDirectoryPage = () => {
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const deferredSearch = useDeferredValue(search);
  const { push } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<AlumniDirectoryResponse>({
    queryKey: ['alumni-directory'],
    queryFn: async () => {
      const response = await api.get<AlumniDirectoryResponse>(
        '/alumni/directory'
      );
      return response.data;
    },
    staleTime: 1000 * 60 * 5
  });

  const alumniList = data?.data ?? [];

  const sendRequestMutation = useMutation({
    mutationFn: async (targetId: string) => {
      await api.post(`/connections/request/${targetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections-overview'] });
      push({ message: 'Connection request sent', type: 'success' });
    },
    onError: () => push({ message: 'Unable to send request', type: 'error' })
  });

  const openConversationMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.get(`/messaging/conversations/${userId}`);
      return response.data;
    },
    onSuccess: (conversation) => {
      const conversationId = conversation?._id;
      if (conversationId) {
        navigate(`/messages?conversation=${conversationId}`);
      }
    },
    onError: () =>
      push({ message: 'Unable to start conversation', type: 'error' })
  });

  const filteredAlumni = useMemo(() => {
    const term = deferredSearch.trim().toLowerCase();
    return alumniList.filter((alum) => {
      const matchesSearch = term
        ? alum.name.toLowerCase().includes(term) ||
          alum.email.toLowerCase().includes(term)
        : true;
      const matchesSkill =
        skillFilter === 'all' || alum.skills?.includes(skillFilter);
      return matchesSearch && matchesSkill;
    });
  }, [alumniList, deferredSearch, skillFilter]);

  const skills = useMemo(() => uniqueSkills(alumniList), [alumniList]);

  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Alumni Network</h2>
        <p className="text-sm text-muted">
          Discover alumni mentors, explore their expertise, and grow your
          professional circle.
        </p>
      </header>

      <RecommendedAlumniCarousel />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-white">Directory</h3>
            <p className="text-xs text-white/50">
              {filteredAlumni.length} results
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              className="w-64 rounded bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40"
              placeholder="Search by name or email"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              className="rounded bg-white/10 px-3 py-2 text-sm text-white"
              value={skillFilter}
              onChange={(event) => setSkillFilter(event.target.value)}
            >
              <option value="all">All Skills</option>
              {skills.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-lg bg-white/10"
              />
            ))}
          </div>
        ) : filteredAlumni.length === 0 ? (
          <div className="rounded-lg bg-white/5 p-8 text-center text-sm text-white/60">
            No alumni match your filters.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredAlumni.map((alum) => (
              <article
                key={alum._id}
                className="neon-border rounded-lg bg-surface/80 p-5 shadow-lg"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={
                      alum.profilePicture ||
                      alum.googlePhotoUrl ||
                      `https://i.pravatar.cc/120?u=${alum.email}`
                    }
                    alt={alum.name}
                    className="h-14 w-14 rounded-full border border-white/10 object-cover"
                  />
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-semibold text-white">
                      {alum.name}
                    </h4>
                    <p className="text-xs text-white/60">
                      {alum.bio ?? 'Alumni mentor'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {alum.skills?.slice(0, 4).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-neonCyan/20 px-2 py-1 text-[10px] uppercase tracking-wide text-neonCyan"
                        >
                          {skill}
                        </span>
                      ))}
                      {alum.skills && alum.skills.length > 4 && (
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-white/60">
                          +{alum.skills.length - 4}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 text-xs text-white/50">
                  {alum.experience?.slice(0, 2).map((role, idx) => (
                    <p key={idx}>
                      {role.title ?? 'Role'} · {role.company ?? 'Company'}
                    </p>
                  ))}
                  {typeof alum.overlap === 'number' && alum.overlap > 0 && (
                    <p className="rounded bg-neonCyan/10 px-2 py-1 text-[11px] text-neonCyan">
                      {alum.overlap} shared skill{alum.overlap === 1 ? '' : 's'}
                    </p>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded bg-neonCyan/20 px-3 py-2 text-xs font-semibold text-neonCyan transition hover:bg-neonCyan/30 disabled:opacity-50"
                    onClick={() => sendRequestMutation.mutate(alum._id)}
                    disabled={sendRequestMutation.isPending}
                  >
                    Connect
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
                    onClick={() => openConversationMutation.mutate(alum._id)}
                    disabled={openConversationMutation.isPending}
                  >
                    Message
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </section>
  );
};

export default AlumniDirectoryPage;
