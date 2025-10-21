import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Trophy, Award, Star, Zap } from 'lucide-react';

interface Badge {
  _id: string;
  key: string;
  name: string;
  description: string;
  points: number;
  awardedAt: string;
}

interface BadgeGalleryProps {
  userId: string;
}

const BadgeIcon = ({ badgeKey }: { badgeKey: string }) => {
  const icons: Record<string, React.ReactNode> = {
    'first-post': <Star className="w-6 h-6" />,
    'community-leader': <Trophy className="w-6 h-6" />,
    'skill-master': <Zap className="w-6 h-6" />,
    'connector': <Award className="w-6 h-6" />
  };
  return icons[badgeKey] || <Award className="w-6 h-6" />;
};

export const BadgeGallery = ({ userId }: BadgeGalleryProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ['badges', userId],
    queryFn: async () => {
      const response = await api.get(`/achievements/${userId}/badges`);
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data?.badges?.length) {
    return (
      <div className="text-center py-8 text-slate-400">
        <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No badges earned yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Badges & Achievements</h3>
        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1 rounded-full text-sm font-semibold text-white">
          {data.totalPoints} pts
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {data.badges.map((badge: Badge) => (
          <div
            key={badge._id}
            className="group relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-lg p-4 border border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer"
          >
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg text-cyan-400 group-hover:text-cyan-300">
                <BadgeIcon badgeKey={badge.key} />
              </div>
              <h4 className="text-xs font-bold text-white leading-tight">{badge.name}</h4>
              <p className="text-xs text-slate-400">{badge.points} pts</p>
            </div>

            {/* Tooltip on hover */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-10 w-max">
              <div className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 whitespace-nowrap">
                {badge.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
