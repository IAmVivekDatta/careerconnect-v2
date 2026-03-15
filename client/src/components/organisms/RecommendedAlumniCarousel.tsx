import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Alumni {
  _id: string;
  name: string;
  email: string;
  skills: string[];
  profilePicture?: string;
  googlePhotoUrl?: string;
  bio?: string;
  similarity?: number;
}

interface MeResponse {
  _id: string;
  skills?: string[];
}

const RecommendedAlumniCarousel = () => {
  const { data: alumni, isLoading } = useQuery<{ data: Alumni[] }>({
    queryKey: ['recommended-alumni'],
    queryFn: async () => {
      const { data } = await api.get('/alumni/recommend');
      return data;
    }
  });

  const { data: directory } = useQuery<{ data: Alumni[] }>({
    queryKey: ['alumni-directory-lite'],
    queryFn: async () => {
      const { data } = await api.get('/alumni/directory');
      return data;
    }
  });

  const { data: me } = useQuery<MeResponse>({
    queryKey: ['profile-me-skills'],
    queryFn: async () => {
      const response = await api.get<MeResponse>('/users/me');
      return response.data;
    }
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-lg bg-white/10" />;
  }

  const personalized = alumni?.data ?? [];
  const fallback = directory?.data ?? [];
  const hasSkills = Boolean((me?.skills ?? []).length > 0);
  const recommendedList =
    personalized.length > 0 ? personalized : fallback.slice(0, 8);

  if (recommendedList.length === 0) {
    return (
      <div className="rounded-lg bg-surface/80 p-8 text-center">
        <p className="text-muted">
          No alumni recommendations available right now.
        </p>
      </div>
    );
  }
  const currentAlumnus = recommendedList[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % recommendedList.length);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + recommendedList.length) % recommendedList.length
    );
  };

  return (
    <section className="space-y-4">
      <h3 className="text-lg font-semibold text-neonCyan">
        Recommended Alumni
      </h3>
      {!hasSkills && (
        <div className="rounded-lg border border-neonCyan/35 bg-neonCyan/10 px-4 py-3 text-xs text-neonCyan">
          Complete your skills profile to get personalized alumni matches.
          <Link
            to="/profile/edit"
            className="ml-2 font-semibold underline underline-offset-2"
          >
            Update profile
          </Link>
        </div>
      )}
      <div className="neon-border rounded-lg bg-gradient-to-br from-purple-900/30 to-blue-900/30 p-6">
        <div className="space-y-4">
          {/* Alumni Card */}
          <div className="flex items-center gap-6">
            {/* Avatar */}
            <img
              src={
                currentAlumnus.profilePicture ||
                currentAlumnus.googlePhotoUrl ||
                `https://i.pravatar.cc/150?u=${currentAlumnus.email}`
              }
              alt={currentAlumnus.name}
              className="h-20 w-20 rounded-full border-2 border-neonCyan shadow-lg"
            />

            {/* Info */}
            <div className="flex-1 space-y-2">
              <h4 className="text-xl font-bold text-white">
                {currentAlumnus.name}
              </h4>
              <p className="text-sm text-muted">
                {currentAlumnus.bio || 'Alumni member'}
              </p>
              <div className="flex flex-wrap gap-2">
                {currentAlumnus.skills.slice(0, 3).map((skill) => (
                  <span
                    key={skill}
                    className="inline-block rounded-full bg-neonCyan/20 px-3 py-1 text-xs text-neonCyan"
                  >
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
