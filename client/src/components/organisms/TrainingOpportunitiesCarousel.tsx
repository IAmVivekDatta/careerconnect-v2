import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { ChevronLeft, ChevronRight, BookOpen, Clock, Zap } from 'lucide-react';

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
  trainings: Training[];
}

export const TrainingOpportunitiesCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<TrainingResponse>({
    queryKey: ['recommendedTrainings'],
    queryFn: async () => {
      const response = await api.get('/trainings/recommend');
      return response.data;
    }
  });

  const trainings = data?.trainings || [];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % (trainings.length || 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + (trainings.length || 1)) % (trainings.length || 1));
  };

  const handleSaveTraining = async (trainingId: string) => {
    setIsSaving(trainingId);
    try {
      await api.post(`/trainings/${trainingId}/save`);
      // Could add toast notification here
    } catch (error) {
      console.error('Error saving training:', error);
    } finally {
      setIsSaving(null);
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
      <div className="space-y-4">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Trending Training Opportunities
        </h3>
        <div className="h-80 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (error || !trainings.length) {
    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
          Trending Training Opportunities
        </h3>
        <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-slate-500 mb-4" />
          <p className="text-slate-400">No trainings available at the moment</p>
        </div>
      </div>
    );
  }

  const currentTraining = trainings[currentIndex];

  return (
    <div className="space-y-4">
      <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Trending Training Opportunities
      </h3>

      <div className="relative">
        {/* Main Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-slate-700/50 overflow-hidden hover:border-cyan-500/30 transition-all duration-300 shadow-lg hover:shadow-cyan-500/20">
          {/* Card Header with Provider Logo */}
          <div className="p-6 border-b border-slate-700/30">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={currentTraining.logoUrl}
                  alt={currentTraining.provider}
                  className="w-12 h-12 rounded-lg border border-slate-600/50"
                />
                <div>
                  <p className="text-sm text-slate-400">{currentTraining.provider}</p>
                  <h4 className="text-lg font-bold text-white">{currentTraining.title}</h4>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-cyan-400">{currentTraining.rating}⭐</p>
              </div>
            </div>
          </div>

          {/* Card Content */}
          <div className="p-6 space-y-4">
            <p className="text-slate-300">{currentTraining.description}</p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2">
              {currentTraining.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-sm font-medium rounded-full border border-cyan-500/30"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-3 gap-3 py-4 border-y border-slate-700/30">
              <div className="flex items-center gap-2 text-slate-300">
                <Zap className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="text-xs text-slate-500">Level</p>
                  <p className={`text-sm font-semibold px-2 py-1 rounded capitalize ${getLevelColor(currentTraining.level)}`}>
                    {currentTraining.level}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="w-4 h-4 text-cyan-400" />
                <div>
                  <p className="text-xs text-slate-500">Duration</p>
                  <p className="text-sm font-semibold">{currentTraining.duration}h</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Price</p>
                <p className="text-sm font-semibold text-cyan-400">
                  ${currentTraining.price === 0 ? 'FREE' : currentTraining.price}
                </p>
              </div>
            </div>

            {/* Start Date */}
            <p className="text-sm text-slate-400">
              Starts: <span className="text-cyan-400 font-semibold">
                {new Date(currentTraining.startDate).toLocaleDateString()}
              </span>
            </p>
          </div>

          {/* Card Footer - Actions */}
          <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700/30 flex gap-3">
            <button
              onClick={() => window.open(currentTraining.url, '_blank')}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Enroll Now
            </button>
            <button
              onClick={() => handleSaveTraining(currentTraining._id)}
              disabled={isSaving === currentTraining._id}
              className="flex-1 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 font-semibold rounded-lg border border-slate-600/50 hover:border-cyan-500/30 transition-all duration-200 disabled:opacity-50"
            >
              {isSaving === currentTraining._id ? 'Saving...' : 'Save for Later'}
            </button>
          </div>
        </div>

        {/* Navigation Buttons */}
        {trainings.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute -left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 transform hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute -right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-cyan-500/50 transition-all duration-200 transform hover:scale-110"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Progress Dots */}
        {trainings.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
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

      {/* Counter */}
      <p className="text-center text-sm text-slate-400">
        {currentIndex + 1} of {trainings.length} trainings
      </p>
    </div>
  );
};
