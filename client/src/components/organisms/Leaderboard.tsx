import { useQuery } from '@tanstack/react-query';
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

  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-400" />
        Leaderboard
      </h3>

      {data.map((user: LeaderboardUser, idx: number) => (
        <button
          key={user._id}
          onClick={() => navigate(`/profile/${user._id}`)}
          className="w-full group relative bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 rounded-lg p-4 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 text-left"
        >
          <div className="flex items-center gap-4">
            {/* Rank Badge */}
            <div
              className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
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

            {/* Avatar & Name */}
            <div className="flex-1 min-w-0">
              <Avatar
                src={user.profilePicture ?? user.googlePhotoUrl}
                alt={user.name}
              />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">
                {user.name}
              </p>
              <p className="text-xs text-slate-400">
                {user.badges.length} badge{user.badges.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Points */}
            <div className="flex-shrink-0 text-right">
              <div className="flex items-center gap-1 text-cyan-400 font-bold">
                <Flame className="w-4 h-4" />
                {user.points}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
