import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import Avatar from '../atoms/Avatar';
import { Zap, Award } from 'lucide-react';
import useAuthStore from '../../store/useAuthStore';

interface SkillEndorsement {
  _id: string;
  name: string;
  profilePicture?: string;
  googlePhotoUrl?: string;
}

interface SkillEndorsementsProps {
  userId: string;
  skills: string[];
  isOwnProfile?: boolean;
}

export const SkillEndorsements = ({
  userId,
  skills,
  isOwnProfile
}: SkillEndorsementsProps) => {
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();

  const { data: endorsements, isLoading } = useQuery({
    queryKey: ['endorsements', userId],
    queryFn: async () => {
      const response = await api.get(`/achievements/${userId}/endorsements`);
      return response.data as Record<string, SkillEndorsement[]>;
    }
  });

  const endorseSkillMutation = useMutation({
    mutationFn: async (skill: string) => {
      const response = await api.post(`/achievements/${userId}/endorse`, {
        skill
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endorsements', userId] });
      setSelectedSkill('');
    }
  });

  const removeEndorsementMutation = useMutation({
    mutationFn: async (skill: string) => {
      const response = await api.delete(
        `/achievements/${userId}/endorse/${skill}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['endorsements', userId] });
    }
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
        <Zap className="w-5 h-5 text-cyan-400" />
        Skill Endorsements
      </h3>

      {/* Skills Grid with Endorsement Counts */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {skills.map((skill) => {
          const endorsers = endorsements?.[skill] || [];
          const isEndorsed = endorsers.some(
            (e: any) => e._id === currentUser?._id
          );

          return (
            <div
              key={skill}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-3 border border-slate-700/50 hover:border-cyan-500/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-white truncate">
                  {skill}
                </p>
                <span className="flex-shrink-0 bg-cyan-500/20 text-cyan-400 text-xs font-bold px-2 py-1 rounded-full">
                  {endorsers.length}
                </span>
              </div>

              {/* Endorsers Avatars */}
              {endorsers.length > 0 && (
                <div className="flex gap-1 mb-2">
                  {endorsers.slice(0, 3).map((endorser: any) => (
                    <Avatar
                      key={endorser._id}
                      src={endorser.profilePicture ?? endorser.googlePhotoUrl}
                      alt={endorser.name}
                    />
                  ))}
                  {endorsers.length > 3 && (
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-700/50 text-xs font-bold text-slate-300">
                      +{endorsers.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* Endorse Button (for other users) */}
              {!isOwnProfile && (
                <button
                  onClick={() => endorseSkillMutation.mutate(skill)}
                  disabled={isEndorsed || endorseSkillMutation.isPending}
                  className={`w-full text-xs font-medium px-2 py-1.5 rounded-md transition-all duration-200 ${
                    isEndorsed
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30'
                  } disabled:opacity-50`}
                >
                  {isEndorsed ? '✓ Endorsed' : 'Endorse'}
                </button>
              )}

              {/* Remove Endorsement (for own profile if endorsed) */}
              {isOwnProfile && isEndorsed && (
                <button
                  onClick={() => removeEndorsementMutation.mutate(skill)}
                  disabled={removeEndorsementMutation.isPending}
                  className="w-full text-xs font-medium px-2 py-1.5 rounded-md bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all duration-200 disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
          );
        })}
      </div>

      {skills.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No skills to endorse yet</p>
        </div>
      )}
    </div>
  );
};
