import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import useAuthStore from '../../store/useAuthStore';
import { useToast } from '../atoms/Toast';
import NeonCard from '../molecules/NeonCard';
import type { Opportunity } from '../../types';

interface AlumniRecommendation {
  _id: string;
  name: string;
  email: string;
  skills?: string[];
  profilePicture?: string;
  googlePhotoUrl?: string;
  bio?: string;
}

const RightSidebar = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { push } = useToast();

  const { data: alumniData, isLoading: alumniLoading } = useQuery<{
    data: AlumniRecommendation[];
  }>({
    queryKey: ['right-sidebar-recommended-alumni'],
    queryFn: async () => {
      const { data } = await api.get('/alumni/recommend');
      return data;
    }
  });

  const { data: opportunitiesData, isLoading: opportunitiesLoading } = useQuery<
    Opportunity[]
  >({
    queryKey: ['right-sidebar-trending-opportunities'],
    queryFn: async () => {
      const { data } = await api.get('/opportunities', {
        params: { approved: 'true' }
      });
      return data as Opportunity[];
    }
  });

  const sendRequestMutation = useMutation({
    mutationFn: (userId: string) => api.post(`/connections/request/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['right-sidebar-recommended-alumni']
      });
      queryClient.invalidateQueries({ queryKey: ['connections-overview'] });
      push({ message: 'Connection request sent', type: 'success' });
    },
    onError: () => push({ message: 'Unable to send request', type: 'error' })
  });

  const openConversationMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await api.get(`/messaging/conversations/${userId}`);
      return response.data;
    },
    onSuccess: (conversation) => {
      const conversationId = conversation?._id;
      if (conversationId) {
        navigate(`/messages?conversation=${conversationId}`);
      }
    },
    onError: () =>
      push({ message: 'Unable to start conversation', type: 'error' })
  });

  const recommendedAlumni = useMemo(
    () =>
      (alumniData?.data ?? [])
        .filter((alumni) => alumni._id !== user?._id)
        .slice(0, 3),
    [alumniData?.data, user?._id]
  );

  const trendingOpportunities = useMemo(
    () =>
      [...(opportunitiesData ?? [])]
        .sort((a, b) => {
          const aApplicants =
            (a as Opportunity & { applicants?: string[] }).applicants?.length ??
            0;
          const bApplicants =
            (b as Opportunity & { applicants?: string[] }).applicants?.length ??
            0;

          if (bApplicants !== aApplicants) {
            return bApplicants - aApplicants;
          }

          const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bTime - aTime;
        })
        .slice(0, 4),
    [opportunitiesData]
  );

  return (
    <div className="hidden flex-col gap-4 lg:flex">
      <NeonCard title="Recommended Alumni">
        {alumniLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="h-16 animate-pulse rounded bg-card/70"
              />
            ))}
          </div>
        ) : recommendedAlumni.length === 0 ? (
          <>
            <p className="text-sm text-muted-foreground">
              Add skills to your profile to unlock personalized alumni picks.
            </p>
            <Link
              to="/profile/edit"
              className="mt-3 inline-flex rounded-md border border-sidebar-active/50 px-3 py-1.5 text-xs font-semibold text-sidebar-active transition hover:bg-sidebar-active/10"
            >
              Update profile
            </Link>
          </>
        ) : (
          <div className="space-y-3">
            {recommendedAlumni.map((alumni) => (
              <article
                key={alumni._id}
                className="rounded-lg border border-border/70 bg-card/70 p-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={
                      alumni.profilePicture ||
                      alumni.googlePhotoUrl ||
                      `https://i.pravatar.cc/80?u=${alumni.email}`
                    }
                    alt={alumni.name}
                    className="h-10 w-10 rounded-full border border-border/70 object-cover"
                    loading="lazy"
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/profile/${alumni._id}`}
                      className="truncate text-sm font-semibold text-foreground hover:text-neonCyan"
                    >
                      {alumni.name}
                    </Link>
                    <p className="truncate text-xs text-muted-foreground">
                      {alumni.skills?.slice(0, 2).join(', ') ||
                        alumni.bio ||
                        'Alumni'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => sendRequestMutation.mutate(alumni._id)}
                    disabled={sendRequestMutation.isPending}
                    className="rounded-md border border-sidebar-active/50 px-2 py-1 text-xs font-semibold text-sidebar-active transition hover:bg-sidebar-active/10 disabled:opacity-60"
                  >
                    Connect
                  </button>
                  <button
                    type="button"
                    onClick={() => openConversationMutation.mutate(alumni._id)}
                    disabled={openConversationMutation.isPending}
                    className="rounded-md border border-border/70 px-2 py-1 text-xs font-semibold text-foreground transition hover:border-sidebar-active/50 hover:text-sidebar-active disabled:opacity-60"
                  >
                    Message
                  </button>
                </div>
              </article>
            ))}
            <Link
              to="/alumni"
              className="inline-flex text-xs font-semibold text-sidebar-active hover:text-sidebar-active/80"
            >
              View all alumni
            </Link>
          </div>
        )}
      </NeonCard>

      <NeonCard title="Trending Opportunities">
        {opportunitiesLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, idx) => (
              <div
                key={idx}
                className="h-14 animate-pulse rounded bg-card/70"
              />
            ))}
          </div>
        ) : trendingOpportunities.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No approved opportunities yet. Check back soon.
          </p>
        ) : (
          <div className="space-y-2">
            {trendingOpportunities.map((opportunity) => {
              const applicantCount = (
                opportunity as Opportunity & { applicants?: string[] }
              ).applicants?.length;

              return (
                <Link
                  key={opportunity._id}
                  to={`/opportunity/${opportunity._id}`}
                  className="block rounded-lg border border-border/70 bg-card/70 p-3 transition hover:border-sidebar-active/50"
                >
                  <p className="line-clamp-1 text-sm font-semibold text-foreground">
                    {opportunity.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {opportunity.company} • {opportunity.type}
                  </p>
                  <p className="mt-1 text-[11px] text-neonCyan">
                    {typeof applicantCount === 'number'
                      ? `${applicantCount} applicant${applicantCount === 1 ? '' : 's'}`
                      : 'New listing'}
                  </p>
                </Link>
              );
            })}
            <Link
              to="/opportunities"
              className="inline-flex text-xs font-semibold text-sidebar-active hover:text-sidebar-active/80"
            >
              Explore all opportunities
            </Link>
          </div>
        )}
      </NeonCard>
    </div>
  );
};

export default RightSidebar;
