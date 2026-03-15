import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import Avatar from '../atoms/Avatar';
import { Trophy, Flame } from 'lucide-react';

interface LeaderboardBadge {
  _id: string;
  name: string;
}

interface LeaderboardUser {
  _id: string;
  name: string;
  points: number;
  profilePicture?: string;
  googlePhotoUrl?: string;
  badges: LeaderboardBadge[];
}

export const Leaderboard = () => {
  const [visibleCount, setVisibleCount] = useState(5);
  const { data, isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await api.get('/achievements/leaderboard');
      return response.data as LeaderboardUser[];
    }
  });

  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Trophy className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No leaderboard data</p>
      </div>
    );
  }

  const visibleUsers = data.slice(0, visibleCount);
  const canLoadMore = data.length > visibleCount;

  return (
    <div className="space-y-2">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          Leaderboard
        </h3>
        <span className="text-xs text-white/60">
          Showing {Math.min(visibleCount, data.length)} of {data.length}
        </span>
      </div>

      {visibleUsers.map((user: LeaderboardUser, idx: number) => (
        <button
          key={user._id}
          onClick={() => navigate(`/profile/${user._id}`)}
          className="w-full group relative bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 rounded-lg p-3 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 text-left"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                idx === 0
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white'
                  : idx === 1
                    ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900'
                    : idx === 2
                      ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white'
                      : 'bg-slate-700 text-slate-300'
              }`}
            >
              {idx < 3 && [idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉']}
              {idx >= 3 && `#${idx + 1}`}
            </div>

            <Avatar
              src={user.profilePicture ?? user.googlePhotoUrl}
              alt={user.name}
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                {user.name}
              </p>
              <p className="text-xs text-slate-400">
                {user.badges.length} badge{user.badges.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-1 text-cyan-400 font-bold text-sm">
                <Flame className="w-4 h-4" />
                {user.points}
              </div>
            </div>
          </div>
        </button>
      ))}

      {canLoadMore && (
        <button
          type="button"
          onClick={() => setVisibleCount((count) => count + 5)}
          className="mt-2 rounded-full border border-cyan-500/40 px-4 py-1.5 text-xs font-semibold text-cyan-300 transition hover:border-cyan-400"
        >
          Load more rankings
        </button>
      )}

      {visibleCount > 5 && (
        <button
          type="button"
          onClick={() => setVisibleCount(5)}
          className="ml-2 mt-2 rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white/70 transition hover:text-white"
        >
          Show less
        </button>
      )}
    </div>
  );
};
