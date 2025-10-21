import { Leaderboard } from "../components/organisms/Leaderboard";
import { BadgeGallery } from "../components/organisms/BadgeGallery";
import { SkillEndorsements } from "../components/organisms/SkillEndorsements";
import useAuthStore from "../store/useAuthStore";

const AchievementsPage = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-2xl font-bold">Achievements & Badges</h2>
        <p className="text-sm text-muted">Track your achievements, badges, and leaderboard ranking</p>
      </header>

      <div className="grid gap-6">
        <div>
          <h3 className="text-xl font-semibold mb-4">Leaderboard</h3>
          <Leaderboard />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Your Badges</h3>
          <BadgeGallery userId={user._id} />
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-4">Skill Endorsements</h3>
          <SkillEndorsements userId={user._id} skills={[]} />
        </div>
      </div>
    </section>
  );
};

export default AchievementsPage;
