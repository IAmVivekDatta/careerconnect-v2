import { useQuery } from "@tanstack/react-query";
import { Leaderboard } from "../components/organisms/Leaderboard";
import { BadgeGallery } from "../components/organisms/BadgeGallery";
import { SkillEndorsements } from "../components/organisms/SkillEndorsements";
import useAuthStore from "../store/useAuthStore";
import api from "../lib/axios";

interface ProfileResponse {
  _id: string;
  skills: string[];
}

const AchievementsPage = () => {
  const { user } = useAuthStore();

  const { data: profile, isLoading } = useQuery<ProfileResponse>({
    queryKey: ["profile", user?._id],
    queryFn: async () => {
      const response = await api.get<ProfileResponse>("/users/me");
      return response.data;
    },
    enabled: Boolean(user?._id)
  });

  if (!user) {
    return <div className="text-sm text-white/60">Loading profile…</div>;
  }

  return (
    <section className="space-y-8">
      <header className="space-y-1">
        <h2 className="text-2xl font-bold text-white">Achievements &amp; Badges</h2>
        <p className="text-sm text-muted">Track progress, celebrate wins, and showcase your strengths.</p>
      </header>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Leaderboard</h3>
        <Leaderboard />
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Your Badges</h3>
        <BadgeGallery userId={user._id} />
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold text-white">Skill Endorsements</h3>
        <SkillEndorsements
          userId={user._id}
          skills={profile?.skills ?? []}
          isOwnProfile
        />
        {isLoading && <p className="text-xs text-white/50">Loading your skills…</p>}
      </section>
    </section>
  );
};

export default AchievementsPage;
