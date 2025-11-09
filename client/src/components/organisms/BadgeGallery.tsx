import { ReactNode, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Trophy, Award, Star, Zap } from 'lucide-react';
import { BadgeResponse, BadgeWithMeta } from '../../types';

interface BadgeGalleryProps {
  userId: string;
}

const BadgeIcon = ({ badgeKey }: { badgeKey: string }) => {
  const icons: Record<string, ReactNode> = {
    'first-post': <Star className="w-6 h-6" />,
    'community-leader': <Trophy className="w-6 h-6" />,
    'skill-master': <Zap className="w-6 h-6" />,
    'connector': <Award className="w-6 h-6" />
  };
  return icons[badgeKey] || <Award className="w-6 h-6" />;
};

export const BadgeGallery = ({ userId }: BadgeGalleryProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, isFetching } = useQuery<BadgeResponse>({
    queryKey: ['badges', userId],
    queryFn: async () => {
      const response = await api.get<BadgeResponse>(`/achievements/${userId}/badges`);
      return response.data;
    },
    staleTime: 1000 * 60 * 5
  });

  const filteredBadges = useMemo<BadgeWithMeta[]>(() => {
    if (!data?.badges) return [];
    const term = searchTerm.trim().toLowerCase();
    if (!term) return data.badges;
    return data.badges.filter(
      (badge) =>
        badge.name.toLowerCase().includes(term) || badge.description.toLowerCase().includes(term)
    );
  }, [data?.badges, searchTerm]);

  if (isLoading || isFetching) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gradient-to-br from-slate-900 to-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!filteredBadges.length) {
    return (
      <div className="rounded-lg bg-white/5 p-6 text-center text-sm text-white/60">
        <Award className="mx-auto mb-2 h-12 w-12 opacity-50" />
        <p>No badges match your filters yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Badges &amp; Achievements</h3>
          <p className="text-xs text-white/60">
            {data?.totalPoints ? `${data.totalPoints.toLocaleString()} lifetime points` : 'Track your impact'}
          </p>
        </div>
        <input
          className="w-full max-w-xs rounded bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40"
          placeholder="Search badges..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {filteredBadges.map((badge) => (
          <div
            key={`${badge.key}-${badge.awardedAt}`}
            className="group relative cursor-pointer rounded-lg border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 transition-all duration-300 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
          >
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className="rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-2 text-cyan-400 group-hover:text-cyan-300">
                <BadgeIcon badgeKey={badge.key} />
              </div>
              <h4 className="text-xs font-bold leading-tight text-white">{badge.name}</h4>
              <p className="text-xs text-slate-400">{badge.points} pts</p>
              <p className="text-[10px] uppercase tracking-wide text-white/40">
                Awarded {new Date(badge.awardedAt).toLocaleDateString()}
              </p>
            </div>

            <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <div className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-300">
                {badge.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
