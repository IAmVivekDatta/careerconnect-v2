import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useState } from 'react';

interface Alumni {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  profilePicture?: string;
  bio?: string;
  similarity?: number;
}

const RecommendedAlumniCarousel = () => {
  const { data: alumni, isLoading } = useQuery<{ data: Alumni[] }>({
    queryKey: ['recommended-alumni'],
    queryFn: async () => {
      const { data } = await api.get('/alumni/recommend');
      return data;
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-lg bg-white/10" />;
  }

  if (!alumni?.data || alumni.data.length === 0) {
    return (
      <div className="rounded-lg bg-surface/80 p-8 text-center">
        <p className="text-muted">Complete your skills profile to see recommended alumni</p>
      </div>
    );
  }

  const recommendedList = alumni.data;
  const currentAlumnus = recommendedList[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % recommendedList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + recommendedList.length) % recommendedList.length);
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-neonCyan">Recommended Alumni</h3>
      <div className="neon-border rounded-lg bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-6">
        <div className="space-y-4">
          {/* Alumni Card */}
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <img
              src={currentAlumnus.profilePicture || `https://i.pravatar.cc/150?u=${currentAlumnus.email}`}
              alt={currentAlumnus.name}
              className="h-20 w-20 rounded-full border-2 border-neonCyan shadow-lg"
            />

            {/* Info */}
            <div className="flex-1 space-y-2">
              <h4 className="text-xl font-bold text-white">{currentAlumnus.name}</h4>
              <p className="text-sm text-muted">{currentAlumnus.bio || 'Alumni member'}</p>
              <div className="flex flex-wrap gap-2">
                {currentAlumnus.skills.slice(0, 3).map((skill) => (
                  <span key={skill} className="inline-block rounded-full bg-neonCyan/20 px-3 py-1 text-xs text-neonCyan">
                    {skill}
                  </span>
                ))}
                {currentAlumnus.skills.length > 3 && (
                  <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">
                    +{currentAlumnus.skills.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button className="rounded-lg bg-neonCyan/20 px-4 py-2 text-sm font-medium text-neonCyan hover:bg-neonCyan/30">
                Connect
              </button>
              <button className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20">
                Message
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <button
              onClick={handlePrev}
              className="rounded-full bg-white/10 p-2 hover:bg-white/20"
              aria-label="Previous alumni"
            >
              ←
            </button>

            <div className="flex gap-1">
              {recommendedList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-2 w-2 rounded-full transition ${
                    idx === currentIndex ? 'bg-neonCyan' : 'bg-white/30'
                  }`}
                  aria-label={`Go to alumni ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="rounded-full bg-white/10 p-2 hover:bg-white/20"
              aria-label="Next alumni"
            >
              →
            </button>
          </div>

          <p className="text-center text-xs text-muted">
            {currentIndex + 1} of {recommendedList.length}
          </p>
        </div>
      </div>
    </section>
  );
};

export default RecommendedAlumniCarousel;
