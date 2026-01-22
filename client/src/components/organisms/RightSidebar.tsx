import NeonCard from '../molecules/NeonCard';

const RightSidebar = () => {
  return (
    <div className="hidden flex-col gap-4 lg:flex">
      <NeonCard title="Recommended Alumni">
        <p className="text-sm text-white/85">
          Connect with alumni based on your skills.
        </p>
      </NeonCard>
      <NeonCard title="Trending Opportunities">
        <p className="text-sm text-white/85">
          Stay tuned for the hottest openings.
        </p>
      </NeonCard>
    </div>
  );
};

export default RightSidebar;
