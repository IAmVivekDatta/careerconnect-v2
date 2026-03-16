import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Zap
} from 'lucide-react';
import { useToast } from '../atoms/Toast';

interface Training {
  _id: string;
  title: string;
  provider: string;
  skills: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  startDate: string;
  price: number;
  url: string;
  logoUrl: string;
  rating: number;
  description: string;
}

interface TrainingResponse {
  data: Training[];
}

export const TrainingOpportunitiesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState<string | null>(null);
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null);
  const [isEnrollPopupOpen, setIsEnrollPopupOpen] = useState(false);
  const [enrolledTraining, setEnrolledTraining] = useState<Training | null>(
    null
  );
  const { push } = useToast();

  const { data, isLoading, error } = useQuery<TrainingResponse>({
    queryKey: ['recommendedTrainings'],
    queryFn: async () => {
      const response = await api.get('/trainings/recommend');
      return response.data;
    }
  });

  const trainings = data?.data || [];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % (trainings.length || 1));
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + (trainings.length || 1)) % (trainings.length || 1)
    );
  };

  const handleSaveTraining = async (trainingId: string) => {
    setIsSaving(trainingId);
    try {
      await api.post(`/trainings/${trainingId}/save`);
      push({ message: 'Saved for later', type: 'success' });
    } catch (error) {
      console.error('Error saving training:', error);
      push({ message: 'Could not save this training', type: 'error' });
    } finally {
      setIsSaving(null);
    }
  };

  const handleEnrollTraining = async (training: Training) => {
    setIsEnrolling(training._id);
    try {
      await api.post(`/trainings/${training._id}/save`);
      setEnrolledTraining(training);
      setIsEnrollPopupOpen(true);
    } catch (error: any) {
      const serverMessage = String(
        error?.response?.data?.message ?? ''
      ).toLowerCase();
      if (serverMessage.includes('already')) {
        setEnrolledTraining(training);
        setIsEnrollPopupOpen(true);
        return;
      }

      console.error('Error enrolling in training:', error);
      push({
        message: 'Could not complete enrollment right now',
        type: 'error'
      });
    } finally {
      setIsEnrolling(null);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'advanced':
        return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-5">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
          Trending Training Opportunities
        </h3>
        <div className="h-80 animate-pulse rounded-xl bg-gradient-to-br from-slate-900 to-slate-800" />
      </div>
    );
  }

  if (error || !trainings.length) {
    return (
      <div className="space-y-4 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-5">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
          Trending Training Opportunities
        </h3>
        <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-slate-500 mb-4" />
          <p className="text-slate-400">No trainings available at the moment</p>
        </div>
      </div>
    );
  }

  const currentTraining = trainings[currentIndex];
  const visibleSkills = currentTraining.skills.slice(0, 4);
  const remainingSkills = currentTraining.skills.length - visibleSkills.length;

  return (
    <div className="space-y-3 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-slate-900/80 via-slate-900/70 to-slate-950/90 p-4 shadow-[0_20px_55px_-35px_rgba(0,255,255,0.35)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
            <Sparkles className="h-3.5 w-3.5" />
            Hot Picks
          </span>
          <h3 className="mt-2 text-xl font-bold bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
            Trending Training Opportunities
          </h3>
        </div>
        <p className="text-xs text-slate-400">
          {currentIndex + 1} of {trainings.length} trainings
        </p>
      </div>

      <div className="relative">
        <div className="overflow-hidden rounded-xl border border-slate-700/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 transition-all duration-300 hover:border-cyan-500/40 hover:shadow-lg hover:shadow-cyan-500/20">
          <div className="border-b border-slate-700/30 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    {currentTraining.provider}
                  </p>
                  <h4 className="mt-1 line-clamp-2 text-base font-bold text-white">
                    {currentTraining.title}
                  </h4>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs uppercase tracking-wide text-slate-500">
                  Rating
                </p>
                <p className="text-lg font-bold text-cyan-300">
                  {currentTraining.rating} / 5
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3 p-4">
            <p className="line-clamp-3 text-sm leading-relaxed text-slate-300">
              {currentTraining.description}
            </p>

            <div className="flex flex-wrap gap-2">
              {visibleSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-xs font-medium text-cyan-300"
                >
                  {skill}
                </span>
              ))}
              {remainingSkills > 0 && (
                <span className="rounded-full border border-slate-600 bg-slate-700/50 px-2.5 py-1 text-xs font-medium text-slate-300">
                  +{remainingSkills} more
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 border-y border-slate-700/30 py-3">
              <div className="flex items-center gap-2 text-slate-300">
                <Zap className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="text-xs text-slate-500">Level</p>
                  <p
                    className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold capitalize ${getLevelColor(currentTraining.level)}`}
                  >
                    {currentTraining.level}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="text-xs text-slate-500">Duration</p>
                  <p className="text-xs font-semibold">
                    {currentTraining.duration}h
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Price</p>
                <p className="text-xs font-semibold text-cyan-400">
                  $
                  {currentTraining.price === 0 ? 'FREE' : currentTraining.price}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Starts:{' '}
              <span className="text-cyan-400 font-semibold">
                {new Date(currentTraining.startDate).toLocaleDateString()}
              </span>
            </p>
          </div>

          <div className="flex gap-2 border-t border-slate-700/30 bg-slate-900/50 px-4 py-3">
            <button
              onClick={() => handleEnrollTraining(currentTraining)}
              disabled={isEnrolling === currentTraining._id}
              className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-2 text-sm font-semibold text-white transition-all duration-200 hover:from-cyan-600 hover:to-blue-600 disabled:opacity-60"
            >
              {isEnrolling === currentTraining._id
                ? 'Enrolling...'
                : 'Enroll Now'}
            </button>
            <button
              onClick={() => handleSaveTraining(currentTraining._id)}
              disabled={isSaving === currentTraining._id}
              className="flex-1 rounded-lg border border-slate-600/50 bg-slate-700/50 px-3 py-2 text-sm font-semibold text-slate-200 transition-all duration-200 hover:border-cyan-500/30 hover:bg-slate-600/50 disabled:opacity-50"
            >
              {isSaving === currentTraining._id ? 'Saving...' : 'Bookmark'}
            </button>
          </div>
        </div>

        {trainings.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute -left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-cyan-600 hover:to-blue-600 hover:shadow-cyan-500/50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute -right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:from-cyan-600 hover:to-blue-600 hover:shadow-cyan-500/50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {trainings.length > 1 && (
          <div className="mt-4 flex justify-center gap-2">
            {trainings.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex
                    ? 'w-8 bg-gradient-to-r from-cyan-400 to-blue-500'
                    : 'w-2 bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {isEnrollPopupOpen && enrolledTraining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-cyan-500/30 bg-slate-900 p-6 shadow-[0_30px_80px_-40px_rgba(0,255,255,0.35)]">
            <div className="mb-4 flex items-center gap-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              <h4 className="text-xl font-bold text-white">
                Successfully enrolled!
              </h4>
            </div>

            <p className="text-sm text-slate-300">
              You are enrolled in{' '}
              <span className="font-semibold text-cyan-300">
                {enrolledTraining.title}
              </span>
              .
            </p>
            <p className="mt-2 text-sm text-slate-300">
              You can make the payment later if you like this course.
            </p>
            <p className="mt-2 text-sm font-semibold text-amber-300">
              Please log back in after 1 hour.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  window.open(enrolledTraining.url, '_blank');
                }}
                className="flex-1 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 font-semibold text-white transition hover:from-cyan-600 hover:to-blue-600"
              >
                Open Course
              </button>
              <button
                onClick={() => {
                  setIsEnrollPopupOpen(false);
                  setEnrolledTraining(null);
                }}
                className="flex-1 rounded-lg border border-slate-600 px-4 py-2 font-semibold text-slate-200 transition hover:border-cyan-500/40"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
