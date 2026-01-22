import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Flame, Sparkles, Star, Target, Trophy, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Leaderboard } from '../components/organisms/Leaderboard';
import { BadgeGallery } from '../components/organisms/BadgeGallery';
import { SkillEndorsements } from '../components/organisms/SkillEndorsements';
import useAuthStore from '../store/useAuthStore';
import api from '../lib/axios';
import type { BadgeResponse, QuestProgressResponse } from '../types';

interface ProfileResponse {
  _id: string;
  skills: string[];
}

interface LeaderboardEntry {
  _id: string;
  name: string;
  points: number;
}

type Quest = {
  id: string;
  title: string;
  description: string;
  reward: string;
  focus: 'community' | 'connections' | 'opportunities';
  href?: string;
};

interface Milestone {
  id: string;
  label: string;
  threshold: number;
  description: string;
}

const ACHIEVEMENT_MILESTONES: Milestone[] = [
  {
    id: 'orientation',
    label: 'Orientation Complete',
    threshold: 0,
    description: 'You kicked off your CareerConnect journey.'
  },
  {
    id: 'rising-talent',
    label: 'Rising Talent',
    threshold: 200,
    description: 'Share wins and interact to reach Rising Talent.'
  },
  {
    id: 'campus-icon',
    label: 'Campus Icon',
    threshold: 500,
    description: 'Host conversations and mentor peers to shine campus-wide.'
  },
  {
    id: 'industry-luminary',
    label: 'Industry Luminary',
    threshold: 1000,
    description: 'Lead thought-leadership moments and spotlight opportunities.'
  },
  {
    id: 'legacy-builder',
    label: 'Legacy Builder',
    threshold: 2000,
    description: 'Craft initiatives that leave a lasting impact on the network.'
  }
];

const QUEST_LIBRARY: Quest[] = [
  {
    id: 'share-update',
    title: "Share today's win",
    description: 'Post a meaningful update to inspire the community feed.',
    reward: '+25 pts',
    focus: 'community',
    href: '/feed'
  },
  {
    id: 'endorse-peer',
    title: 'Endorse a teammate',
    description: 'Visit Connections and endorse a skill you trust.',
    reward: '+15 pts',
    focus: 'connections',
    href: '/connections'
  },
  {
    id: 'explore-opportunity',
    title: 'Scout an opportunity',
    description: 'Discover a new role on the Opportunities board.',
    reward: '+30 pts',
    focus: 'opportunities',
    href: '/opportunities'
  },
  {
    id: 'refresh-profile',
    title: 'Refresh your profile',
    description: 'Add a new achievement or upload the latest resume.',
    reward: '+20 pts',
    focus: 'community',
    href: '/profile/edit'
  }
];

const AchievementsPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile } = useQuery<ProfileResponse>({
    queryKey: ['profile', user?._id],
    queryFn: async () => {
      const response = await api.get<ProfileResponse>('/users/me');
      return response.data;
    },
    enabled: Boolean(user?._id)
  });

  const { data: badgeSummary, isLoading: isBadgeSummaryLoading } =
    useQuery<BadgeResponse>({
      queryKey: ['badges', user?._id],
      queryFn: async () => {
        const response = await api.get<BadgeResponse>(
          `/achievements/${user?._id}/badges`
        );
        return response.data;
      },
      enabled: Boolean(user?._id)
    });

  const { data: endorsementMap, isLoading: isEndorsementsLoading } = useQuery<
    Record<string, Array<{ _id: string }>>
  >({
    queryKey: ['endorsements', user?._id],
    queryFn: async () => {
      const response = await api.get(`/achievements/${user?._id}/endorsements`);
      return response.data as Record<string, Array<{ _id: string }>>;
    },
    enabled: Boolean(user?._id)
  });

  const { data: leaderboardData } = useQuery<LeaderboardEntry[]>({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await api.get<LeaderboardEntry[]>(
        '/achievements/leaderboard'
      );
      return response.data;
    }
  });

  const { data: questProgress, isLoading: isQuestProgressLoading } =
    useQuery<QuestProgressResponse>({
      queryKey: ['quest-progress', user?._id],
      queryFn: async () => {
        const response = await api.get<QuestProgressResponse>(
          `/achievements/${user?._id}/quests`
        );
        return response.data;
      },
      enabled: Boolean(user?._id)
    });

  const toggleQuestMutation = useMutation<
    QuestProgressResponse,
    unknown,
    string
  >({
    mutationFn: async (questId) => {
      if (!user?._id) {
        throw new Error('User not ready');
      }
      const response = await api.post<QuestProgressResponse>(
        `/achievements/${user._id}/quests`,
        {
          questId
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['quest-progress', user?._id], data);
    }
  });

  const completedQuestIds = questProgress?.completedToday ?? [];
  const questStreak = questProgress?.streak ?? 0;

  const totalPoints = badgeSummary?.totalPoints ?? 0;
  const totalBadges = badgeSummary?.badges.length ?? 0;
  const totalSkills = profile?.skills.length ?? 0;

  const endorsementCount = useMemo(() => {
    if (!endorsementMap) return 0;
    return Object.values(endorsementMap).reduce(
      (acc, endorsers) => acc + endorsers.length,
      0
    );
  }, [endorsementMap]);

  const highestMomentumSkill = useMemo(() => {
    if (!endorsementMap || Object.keys(endorsementMap).length === 0)
      return null;
    const sorted = Object.entries(endorsementMap).sort(
      (a, b) => b[1].length - a[1].length
    );
    return sorted[0]?.[0] ?? null;
  }, [endorsementMap]);

  const userRank = useMemo(() => {
    if (!leaderboardData || !user?._id) return null;
    const index = leaderboardData.findIndex((entry) => entry._id === user._id);
    return index >= 0 ? index + 1 : null;
  }, [leaderboardData, user?._id]);

  const leaderboardSize = leaderboardData?.length ?? 0;
  const percentile = useMemo(() => {
    if (!userRank || leaderboardSize === 0) return null;
    return Math.max(1, Math.round((userRank / leaderboardSize) * 100));
  }, [userRank, leaderboardSize]);

  const previousMilestone = useMemo(() => {
    let milestone = ACHIEVEMENT_MILESTONES[0];
    for (const entry of ACHIEVEMENT_MILESTONES) {
      if (totalPoints >= entry.threshold) {
        milestone = entry;
      }
    }
    return milestone;
  }, [totalPoints]);

  const baseNextMilestone = useMemo(
    () =>
      ACHIEVEMENT_MILESTONES.find((entry) => totalPoints < entry.threshold) ??
      null,
    [totalPoints]
  );

  const nextMilestone = useMemo<Milestone>(() => {
    if (baseNextMilestone) return baseNextMilestone;
    return {
      id: 'legendary',
      label: 'Hall of Legends',
      threshold: totalPoints + 500,
      description: 'Set new records and keep the momentum blazing.'
    };
  }, [baseNextMilestone, totalPoints]);

  const milestoneProgress = useMemo(() => {
    const span = Math.max(
      1,
      nextMilestone.threshold - previousMilestone.threshold
    );
    const progressValue = Math.min(
      1,
      Math.max(0, (totalPoints - previousMilestone.threshold) / span)
    );

    return {
      percent: Math.round(progressValue * 100),
      current: previousMilestone,
      upcoming: nextMilestone,
      hasClearedAll: !baseNextMilestone
    };
  }, [baseNextMilestone, nextMilestone, previousMilestone, totalPoints]);

  const completedQuestCount = completedQuestIds.length;

  const questStreakLabel = isQuestProgressLoading
    ? '…'
    : questStreak > 0
      ? `${questStreak} day${questStreak === 1 ? '' : 's'}`
      : '0 days';

  const questStreakHelper = isQuestProgressLoading
    ? 'Tracking streak momentum…'
    : questStreak > 0
      ? 'Keep the blaze alive by returning tomorrow.'
      : 'Complete a quest to ignite your streak.';

  const questCompletionSummary = isQuestProgressLoading
    ? 'Loading…'
    : `${completedQuestCount}/${QUEST_LIBRARY.length} complete`;

  const questStreakBadge = isQuestProgressLoading
    ? 'Streak loading…'
    : `${questStreakLabel} streak`;

  const statCards = useMemo(() => {
    const cards: Array<{
      id: string;
      label: string;
      value: string;
      helper: string;
      icon: LucideIcon;
      gradient: string;
    }> = [
      {
        id: 'badges',
        label: 'Badges unlocked',
        value: isBadgeSummaryLoading ? '…' : totalBadges.toString(),
        helper:
          totalBadges > 0 && badgeSummary?.badges[0]
            ? `Latest: ${badgeSummary.badges[0].name}`
            : 'Earn your first badge by sharing a story.',
        icon: Star,
        gradient: 'from-yellow-500/25 via-orange-500/10 to-rose-500/15'
      },
      {
        id: 'endorsements',
        label: 'Skill endorsements',
        value: isEndorsementsLoading ? '…' : endorsementCount.toString(),
        helper: highestMomentumSkill
          ? `Momentum: ${highestMomentumSkill}`
          : 'Add skills to invite endorsements.',
        icon: Zap,
        gradient: 'from-cyan-500/25 via-blue-500/15 to-purple-500/20'
      },
      {
        id: 'streak',
        label: 'Active streak',
        value: isQuestProgressLoading ? '…' : questStreakLabel,
        helper: isQuestProgressLoading
          ? 'Tracking streak momentum…'
          : questStreakHelper,
        icon: Flame,
        gradient: 'from-amber-500/25 via-orange-500/15 to-rose-500/20'
      },
      {
        id: 'skills',
        label: 'Active skills',
        value: totalSkills.toString(),
        helper:
          totalSkills > 0
            ? 'Spotlight skills in your profile to stand out.'
            : 'Add at least one skill to unlock tailored matches.',
        icon: Sparkles,
        gradient: 'from-emerald-500/20 via-teal-500/10 to-cyan-500/20'
      },
      {
        id: 'quests',
        label: 'Quests cleared',
        value: isQuestProgressLoading
          ? '…'
          : `${completedQuestCount}/${QUEST_LIBRARY.length}`,
        helper: isQuestProgressLoading
          ? 'Loading your quest progress…'
          : completedQuestCount === QUEST_LIBRARY.length
            ? 'All quests complete — streak secured!'
            : `Complete ${QUEST_LIBRARY.length - completedQuestCount} more for a streak boost.`,
        icon: Target,
        gradient: 'from-fuchsia-500/25 via-purple-500/15 to-indigo-500/20'
      }
    ];
    return cards;
  }, [
    badgeSummary?.badges,
    completedQuestCount,
    endorsementCount,
    highestMomentumSkill,
    isBadgeSummaryLoading,
    isEndorsementsLoading,
    isQuestProgressLoading,
    questStreakHelper,
    questStreakLabel,
    totalBadges,
    totalSkills
  ]);

  const handleQuestToggle = (questId: string) => {
    if (!user?._id || toggleQuestMutation.isPending) {
      return;
    }
    toggleQuestMutation.mutate(questId);
  };

  if (!user) {
    return <div className="text-sm text-muted">Loading profile…</div>;
  }

  return (
    <section className="space-y-10 pb-12">
      <div className="grid gap-6 xl:grid-cols-[1.75fr,1fr]">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 via-blue-900/25 to-purple-900/20 p-8 shadow-[0_32px_90px_-40px_rgba(8,14,35,0.85)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,245,255,0.28)_0%,_rgba(12,18,36,0)_60%)] opacity-80" />
          <div className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="relative z-10 flex flex-col gap-8 text-white">
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div className="max-w-xl space-y-3">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-white/70">
                  <Trophy className="h-4 w-4" /> Achievement Arena
                </p>
                <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                  Level up your CareerConnect journey
                </h1>
                <p className="text-sm text-white/70 sm:text-base">
                  Earn experience by sharing insights, endorsing peers, and
                  unlocking opportunities. Keep the streak alive to climb the
                  community leaderboard.
                </p>
              </div>

              <div className="flex flex-col gap-4 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur-md">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    Lifetime points
                  </p>
                  <p className="text-4xl font-black text-white">
                    {totalPoints.toLocaleString()}
                  </p>
                </div>
                <div className="grid w-full gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-xl bg-white/10 px-3 py-2 text-xs">
                    <p className="text-white/60">Current rank</p>
                    <p className="text-lg font-semibold text-white">
                      {userRank ? `#${userRank}` : '—'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-3 py-2 text-xs">
                    <p className="text-white/60">Global percentile</p>
                    <p className="text-lg font-semibold text-white">
                      {percentile ? `Top ${percentile}%` : 'Keep climbing'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white/10 px-3 py-2 text-xs lg:col-span-1">
                    <p className="text-white/60">Active streak</p>
                    <p className="text-lg font-semibold text-white">
                      {isQuestProgressLoading ? '…' : questStreakLabel}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-black/20 p-6 backdrop-blur-md sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1 max-w-md">
                <p className="text-xs uppercase tracking-wide text-white/60">
                  {milestoneProgress.hasClearedAll
                    ? 'Legend status'
                    : 'Next milestone'}
                </p>
                <p className="text-lg font-semibold text-white">
                  {milestoneProgress.hasClearedAll
                    ? 'Legendary streak unlocked'
                    : `${milestoneProgress.upcoming.label} at ${milestoneProgress.upcoming.threshold.toLocaleString()} pts`}
                </p>
                <p className="text-xs text-white/60">
                  {milestoneProgress.hasClearedAll
                    ? milestoneProgress.upcoming.description
                    : previousMilestone.description}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 sm:max-w-md">
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-white/10">
                  <span
                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400"
                    style={{ width: `${milestoneProgress.percent}%` }}
                  />
                </div>
                <p className="text-xs text-white/70">
                  Progress: {milestoneProgress.percent}% toward{' '}
                  {milestoneProgress.upcoming.label}
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          {statCards.map(
            ({ id, label, value, helper, icon: Icon, gradient }) => (
              <div
                key={id}
                className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${gradient} p-5 shadow-[0_24px_60px_-36px_rgba(8,14,34,0.9)] backdrop-blur-lg`}
              >
                <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-white/10 blur-2xl" />
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-white/60">
                      {label}
                    </p>
                    <p className="mt-1 text-2xl font-bold text-white">
                      {value}
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white/80">
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-white/70">{helper}</p>
              </div>
            )
          )}
        </aside>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.75fr,1fr]">
        <section className="neon-border rounded-3xl bg-surface/70 p-6 shadow-[0_32px_70px_-36px_rgba(8,10,26,0.85)]">
          <Leaderboard />
        </section>

        <section className="neon-border flex flex-col gap-4 rounded-3xl bg-surface/70 p-6 shadow-[0_32px_70px_-36px_rgba(8,10,26,0.85)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">
                Quest board
              </p>
              <h2 className="text-lg font-semibold text-white">
                Daily power-ups
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-cyan-400/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-200">
                {questCompletionSummary}
              </span>
              <span className="rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-200">
                🔥 {questStreakBadge}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {QUEST_LIBRARY.map((quest) => {
              const isCompleted = completedQuestIds.includes(quest.id);
              const isUpdatingThisQuest =
                toggleQuestMutation.isPending &&
                toggleQuestMutation.variables === quest.id;

              return (
                <div
                  key={quest.id}
                  className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-surface/90 via-surface/70 to-surface/60 p-5 transition-all duration-200 ${
                    isCompleted
                      ? 'ring-2 ring-emerald-400/40'
                      : 'hover:border-cyan-400/50'
                  }`}
                >
                  <div className="absolute -top-6 -right-6 h-20 w-20 rounded-full bg-cyan-500/10 blur-3xl" />
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-white/60">
                          {quest.focus}
                        </p>
                        <h3 className="text-sm font-semibold text-white">
                          {quest.title}
                        </h3>
                      </div>
                      <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                        {quest.reward}
                      </span>
                    </div>
                    <p className="text-xs text-white/70">{quest.description}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleQuestToggle(quest.id)}
                        disabled={toggleQuestMutation.isPending}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                          isCompleted
                            ? 'border border-emerald-400/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25'
                            : 'border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20'
                        }`}
                      >
                        {isUpdatingThisQuest
                          ? 'Updating...'
                          : isCompleted
                            ? 'Quest cleared'
                            : 'Mark as complete'}
                      </button>
                      {quest.href && (
                        <button
                          type="button"
                          onClick={() => quest.href && navigate(quest.href)}
                          className="text-xs font-semibold text-white/70 underline-offset-4 transition hover:text-cyan-200 hover:underline"
                        >
                          Jump to page
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section className="neon-border rounded-3xl bg-surface/70 p-6 shadow-[0_32px_70px_-36px_rgba(8,10,26,0.85)]">
        <BadgeGallery userId={user._id} />
      </section>

      <section className="neon-border rounded-3xl bg-surface/70 p-6 shadow-[0_32px_70px_-36px_rgba(8,10,26,0.85)]">
        <SkillEndorsements
          userId={user._id}
          skills={profile?.skills ?? []}
          isOwnProfile
        />
      </section>
    </section>
  );
};

export default AchievementsPage;
