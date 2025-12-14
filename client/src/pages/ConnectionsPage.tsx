import { type ChangeEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  Filter,
  MessageCircle,
  Search,
  Send,
  Sparkles,
  UserCheck,
  UserMinus,
  UserPlus,
  Users
} from 'lucide-react';
import api from '../lib/axios';
import { ConnectionsOverview } from '../types';
import { useToast } from '../components/atoms/Toast';
import Avatar from '../components/atoms/Avatar';
import type { LucideIcon } from 'lucide-react';

type TabKey = 'pending' | 'connections' | 'suggestions' | 'outgoing';

const tabLabels: Record<TabKey, string> = {
  connections: 'My Network',
  pending: 'Requests',
  suggestions: 'Suggested',
  outgoing: 'Sent'
};

const roleFilterOptions: Array<{
  value: 'all' | 'student' | 'alumni' | 'admin';
  label: string;
}> = [
  { value: 'all', label: 'All roles' },
  { value: 'student', label: 'Students' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'admin', label: 'Admins' }
];

const sortOptions: Array<{
  value: 'relevance' | 'recent' | 'alphabetical';
  label: string;
}> = [
  { value: 'relevance', label: 'Smart match' },
  { value: 'recent', label: 'Most recent' },
  { value: 'alphabetical', label: 'A to Z' }
];

const formatRelativeTime = (value?: string) => {
  if (!value) return null;
  const target = new Date(value);
  if (Number.isNaN(target.getTime())) return null;

  const diffMs = Date.now() - target.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return 'Just now';
  if (diffMs < hour) {
    const minutes = Math.max(1, Math.floor(diffMs / minute));
    return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  }
  const days = Math.floor(diffMs / day);
  if (days < 7) {
    return `${days} day${days === 1 ? '' : 's'} ago`;
  }
  return target.toLocaleDateString();
};

const ConnectionsPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('suggestions');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<
    'all' | 'student' | 'alumni' | 'admin'
  >('all');
  const [sortKey, setSortKey] = useState<
    'relevance' | 'recent' | 'alphabetical'
  >('relevance');
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { push } = useToast();

  const { data, isLoading, isFetching } = useQuery<ConnectionsOverview>({
    queryKey: ['connections-overview'],
    queryFn: async () => {
      const response = await api.get<ConnectionsOverview>(
        '/connections/overview'
      );
      return response.data;
    },
    staleTime: 1000 * 60
  });

  const isLoadingState = isLoading || isFetching;

  const respondMutation = useMutation({
    mutationFn: ({
      requesterId,
      action
    }: {
      requesterId: string;
      action: 'accept' | 'decline';
    }) => api.post('/connections/respond', { requesterId, action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections-overview'] });
      push({ message: 'Connection updated', type: 'success' });
    },
    onError: () => push({ message: 'Unable to update request', type: 'error' })
  });

  const sendRequestMutation = useMutation({
    mutationFn: (userId: string) => api.post(`/connections/request/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections-overview'] });
      push({ message: 'Request sent', type: 'success' });
    },
    onError: () => push({ message: 'Unable to send request', type: 'error' })
  });

  const cancelMutation = useMutation({
    mutationFn: (userId: string) =>
      api.delete(`/connections/request/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections-overview'] });
      push({ message: 'Request canceled', type: 'success' });
    },
    onError: () => push({ message: 'Unable to cancel request', type: 'error' })
  });

  const removeConnectionMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/connections/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['connections-overview'] });
      push({ message: 'Connection removed', type: 'success' });
    },
    onError: () =>
      push({ message: 'Unable to remove connection', type: 'error' })
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
      push({ message: 'Unable to open conversation', type: 'error' })
  });

  const counts = data?.counts ?? { connections: 0, pending: 0, outgoing: 0 };

  const tabData = useMemo(() => {
    return {
      pending: data?.pending ?? [],
      connections: data?.connections ?? [],
      suggestions: data?.suggestions ?? [],
      outgoing: data?.outgoing ?? []
    };
  }, [data]);

  const aggregatedRoleCounts = useMemo(() => {
    const base = { student: 0, alumni: 0, admin: 0 } as const;
    const tally = { ...base };
    Object.values(tabData).forEach((list) => {
      list.forEach((person) => {
        if (
          person.role === 'student' ||
          person.role === 'alumni' ||
          person.role === 'admin'
        ) {
          tally[person.role] += 1;
        }
      });
    });
    return tally;
  }, [tabData]);

  const totalPeople =
    aggregatedRoleCounts.student +
    aggregatedRoleCounts.alumni +
    aggregatedRoleCounts.admin;

  const availableRoleFilters = useMemo(
    () =>
      roleFilterOptions.filter((option) => {
        if (option.value === 'all') return true;
        return aggregatedRoleCounts[option.value] > 0;
      }),
    [aggregatedRoleCounts]
  );

  const displayList = useMemo(() => {
    const baseList = tabData[activeTab] ?? [];
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = baseList.filter((person) => {
      const matchesRole = roleFilter === 'all' || person.role === roleFilter;
      if (!matchesRole) return false;

      if (!normalizedSearch) return true;
      const haystack = [person.name, person.bio, ...(person.skills ?? [])]
        .filter((value): value is string =>
          Boolean(value && typeof value === 'string')
        )
        .map((entry) => entry.toLowerCase());
      return haystack.some((entry) => entry.includes(normalizedSearch));
    });

    const sorted = [...filtered].sort((a, b) => {
      if (sortKey === 'alphabetical') {
        return a.name.localeCompare(b.name);
      }

      if (sortKey === 'recent') {
        const toTimestamp = (person: typeof a) => {
          const reference = person.requestedAt ?? person.createdAt;
          if (!reference) return 0;
          const date = new Date(reference);
          return Number.isNaN(date.getTime()) ? 0 : date.getTime();
        };
        return toTimestamp(b) - toTimestamp(a);
      }

      const overlapDelta = (b.overlap ?? 0) - (a.overlap ?? 0);
      if (overlapDelta !== 0) return overlapDelta;

      const pointsDelta = (b.points ?? 0) - (a.points ?? 0);
      if (pointsDelta !== 0) return pointsDelta;

      return a.name.localeCompare(b.name);
    });

    return sorted;
  }, [activeTab, roleFilter, searchTerm, sortKey, tabData]);

  const statHighlights = useMemo(() => {
    const suggestionsCount = tabData.suggestions.length;
    const cards: Array<{
      id: string;
      label: string;
      value: string;
      helper: string;
      icon: LucideIcon;
      gradient: string;
    }> = [
      {
        id: 'connections',
        label: 'Active connections',
        value: counts.connections.toString(),
        helper:
          counts.connections > 0
            ? 'Drop a message weekly to keep collaboration warm.'
            : 'Start building your circle with a friendly hello.',
        icon: Users,
        gradient: 'from-cyan-500/25 via-blue-600/20 to-indigo-700/20'
      },
      {
        id: 'pending',
        label: 'Pending invites',
        value: counts.pending.toString(),
        helper:
          counts.pending > 0
            ? 'Respond today to keep momentum high.'
            : 'No requests waiting — explore suggestions to expand.',
        icon: UserPlus,
        gradient: 'from-emerald-500/25 via-teal-500/15 to-cyan-500/15'
      },
      {
        id: 'suggestions',
        label: 'Fresh suggestions',
        value: suggestionsCount.toString(),
        helper:
          suggestionsCount > 0
            ? 'We matched you with peers who share your skills.'
            : 'Refresh your skills to unlock smarter matches.',
        icon: Sparkles,
        gradient: 'from-fuchsia-500/25 via-purple-500/20 to-violet-500/20'
      }
    ];
    return cards;
  }, [counts.connections, counts.pending, tabData.suggestions.length]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    roleFilter !== 'all' ||
    sortKey !== 'relevance';

  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setSortKey('relevance');
  };

  const openProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setSortKey(event.target.value as 'relevance' | 'recent' | 'alphabetical');
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const getTabCount = (tab: TabKey) => {
    if (tab === 'pending') return counts.pending;
    if (tab === 'connections') return counts.connections;
    if (tab === 'outgoing') return counts.outgoing;
    return tabData.suggestions.length;
  };

  const renderEmptyState = (title: string, detail?: string) => (
    <div className="neon-border relative overflow-hidden rounded-3xl bg-surface/70 p-10 text-center shadow-[0_28px_60px_-30px_rgba(9,16,33,0.65)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,245,255,0.18),_rgba(10,17,33,0))]" />
      <Sparkles className="relative mx-auto mb-3 h-8 w-8 text-neonCyan" />
      <h3 className="relative text-lg font-semibold text-white">{title}</h3>
      {detail && (
        <p className="relative mt-2 text-sm text-white/70">{detail}</p>
      )}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={resetFilters}
          className="relative mt-5 inline-flex items-center gap-2 rounded-full border border-neonCyan/40 bg-neonCyan/15 px-4 py-2 text-xs font-semibold text-neonCyan hover:bg-neonCyan/25"
        >
          <Filter className="h-4 w-4" /> Clear filters
        </button>
      )}
    </div>
  );

  const renderCardActions = (tab: TabKey, userId: string) => {
    const sharedButtonClass =
      'flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-55';

    if (tab === 'pending') {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`${sharedButtonClass} border border-neonCyan/50 bg-neonCyan/15 text-neonCyan hover:bg-neonCyan/25`}
            onClick={() =>
              respondMutation.mutate({ requesterId: userId, action: 'accept' })
            }
            disabled={respondMutation.isPending}
          >
            <UserCheck className="h-4 w-4" /> Accept
          </button>
          <button
            type="button"
            className={`${sharedButtonClass} border border-red-500/40 bg-red-500/15 text-red-300 hover:bg-red-500/25`}
            onClick={() =>
              respondMutation.mutate({ requesterId: userId, action: 'decline' })
            }
            disabled={respondMutation.isPending}
          >
            <UserMinus className="h-4 w-4" /> Decline
          </button>
        </div>
      );
    }

    if (tab === 'connections') {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`${sharedButtonClass} border border-white/20 bg-white/10 text-white hover:bg-white/20`}
            onClick={() => openConversationMutation.mutate(userId)}
            disabled={openConversationMutation.isPending}
          >
            <MessageCircle className="h-4 w-4" /> Message
          </button>
          <button
            type="button"
            className={`${sharedButtonClass} border border-red-500/35 bg-red-500/10 text-red-300 hover:bg-red-500/20`}
            onClick={() => removeConnectionMutation.mutate(userId)}
            disabled={removeConnectionMutation.isPending}
          >
            <UserMinus className="h-4 w-4" /> Remove
          </button>
        </div>
      );
    }

    if (tab === 'outgoing') {
      return (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`${sharedButtonClass} border border-white/20 bg-white/10 text-white hover:bg-white/20`}
            onClick={() => openConversationMutation.mutate(userId)}
            disabled={openConversationMutation.isPending}
          >
            <MessageCircle className="h-4 w-4" /> Message
          </button>
          <button
            type="button"
            className={`${sharedButtonClass} border border-amber-400/40 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25`}
            onClick={() => cancelMutation.mutate(userId)}
            disabled={cancelMutation.isPending}
          >
            <Clock className="h-4 w-4" /> Cancel
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`${sharedButtonClass} border border-neonCyan/50 bg-neonCyan/15 text-neonCyan hover:bg-neonCyan/25`}
          onClick={() => sendRequestMutation.mutate(userId)}
          disabled={sendRequestMutation.isPending}
        >
          <UserPlus className="h-4 w-4" /> Connect
        </button>
        <button
          type="button"
          className={`${sharedButtonClass} border border-white/20 bg-white/10 text-white hover:bg-white/20`}
          onClick={() => openConversationMutation.mutate(userId)}
          disabled={openConversationMutation.isPending}
        >
          <Send className="h-4 w-4" /> Message
        </button>
      </div>
    );
  };

  const activeList = tabData[activeTab];

  const defaultEmptyTitle =
    activeTab === 'pending'
      ? 'No incoming requests right now'
      : activeTab === 'connections'
      ? 'Your network is ready to grow'
      : activeTab === 'outgoing'
      ? 'No pending invitations'
      : 'No tailored suggestions yet';

  const defaultEmptyDetail =
    activeTab === 'pending'
      ? "You're all caught up. Explore suggestions to discover new collaborators."
      : activeTab === 'connections'
      ? 'Spark new conversations by reaching out to suggested peers.'
      : activeTab === 'outgoing'
      ? 'Send a fresh invite or reconnect with past classmates.'
      : 'Update your skills and interests to unlock smarter matches.';

  const emptyTitle = hasActiveFilters ? 'No matches found' : defaultEmptyTitle;
  const emptyDetail = hasActiveFilters
    ? 'Adjust your search or reset filters to see more of the community.'
    : defaultEmptyDetail;

  const suggestionCount = tabData.suggestions.length;

  return (
    <section className="space-y-10 pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-cyan-500/15 via-blue-900/25 to-purple-900/20 p-8 shadow-[0_38px_110px_-48px_rgba(6,14,33,0.95)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,245,255,0.28),_rgba(8,14,36,0))]" />
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="relative z-10 flex flex-col gap-6 text-white">
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="max-w-xl space-y-3">
              <p className="text-xs uppercase tracking-[0.32em] text-white/70">
                Network HQ
              </p>
              <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                Grow authentic connections
              </h1>
              <p className="text-sm text-white/70 sm:text-base">
                Manage requests, nurture relationships, and discover
                collaborators aligned with your goals. Your network currently
                spans <span className="text-white">{totalPeople}</span>{' '}
                community members.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
                <p className="text-white/60">Pending invites</p>
                <p className="text-2xl font-bold text-white">
                  {counts.pending}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm">
                <p className="text-white/60">Fresh matches</p>
                <p className="text-2xl font-bold text-white">
                  {suggestionCount}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-white/70">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
              <Users className="h-4 w-4" /> {counts.connections} active
              connections
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
              <UserPlus className="h-4 w-4" /> {counts.pending} invites awaiting
              reply
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1">
              <Sparkles className="h-4 w-4" /> {suggestionCount} new
              introductions curated for you
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {statHighlights.map(
          ({ id, label, value, helper, icon: Icon, gradient }) => (
            <div
              key={id}
              className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${gradient} p-6 shadow-[0_32px_80px_-46px_rgba(7,12,31,0.9)] backdrop-blur`}
            >
              <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-white/10 blur-2xl" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-white/70">
                    {label}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-white">
                    {value}
                  </p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white/80">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="relative mt-3 text-xs text-white/70">{helper}</p>
            </div>
          )
        )}
      </div>

      <div className="neon-border space-y-5 rounded-3xl bg-surface/70 p-6 shadow-[0_32px_80px_-46px_rgba(7,12,31,0.9)]">
        <div className="grid gap-4 md:grid-cols-[minmax(260px,2fr)_minmax(180px,1fr)]">
          <div className="space-y-2">
            <label
              htmlFor="connections-search"
              className="text-xs uppercase tracking-wide text-white/60"
            >
              Search network
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                id="connections-search"
                type="search"
                placeholder="Search by name, skill, or bio…"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-11 py-3 text-sm text-white outline-none transition focus:border-neonCyan/50 focus:ring-2 focus:ring-neonCyan/30"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="connections-sort"
              className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/60"
            >
              <Filter className="h-3.5 w-3.5" /> Sort order
            </label>
            <select
              id="connections-sort"
              value={sortKey}
              onChange={handleSortChange}
              className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/80 outline-none transition focus:border-neonCyan/50 focus:ring-2 focus:ring-neonCyan/30"
            >
              {sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-surface text-white"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-white/60">
            <Users className="h-3.5 w-3.5" /> Filter by role
          </p>
          <div className="flex flex-wrap gap-2">
            {availableRoleFilters.map(({ value, label }) => {
              const isActive = roleFilter === value;
              const countLabel =
                value === 'all' ? totalPeople : aggregatedRoleCounts[value];
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRoleFilter(value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    isActive
                      ? 'border-neonCyan/60 bg-neonCyan/20 text-neonCyan'
                      : 'border-white/10 bg-white/5 text-white/70 hover:border-white/20 hover:text-white'
                  }`}
                >
                  {label}
                  <span className="rounded-full bg-black/30 px-2 py-0.5 text-[10px] font-bold text-white/70">
                    {countLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <nav className="neon-border flex flex-wrap gap-2 rounded-3xl bg-surface/70 p-2 shadow-[0_28px_70px_-44px_rgba(6,12,30,0.85)]">
        {(Object.keys(tabLabels) as TabKey[]).map((tab) => {
          const tabCount = getTabCount(tab);
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? 'bg-neonCyan text-surface shadow-[0_0_22px_rgba(0,245,255,0.35)]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tabLabels[tab]}
              <span
                className={`inline-flex min-w-[28px] items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  isActive
                    ? 'bg-surface text-slate-900'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                {tabCount}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="space-y-6">
        {isLoadingState ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="neon-border h-52 animate-pulse rounded-3xl bg-surface/70"
              />
            ))}
          </div>
        ) : displayList.length === 0 ? (
          renderEmptyState(emptyTitle, emptyDetail)
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayList.map((person) => {
              const roleLabel =
                person.role === 'alumni'
                  ? 'Alumni'
                  : person.role === 'student'
                  ? 'Student'
                  : 'Admin';
              const relativeTimestamp = formatRelativeTime(
                person.requestedAt ?? person.createdAt
              );
              const timestampPrefix =
                activeTab === 'pending'
                  ? 'Requested'
                  : activeTab === 'outgoing'
                  ? 'Sent'
                  : activeTab === 'connections'
                  ? 'Connected'
                  : 'Spotted';
              const bioCopy =
                person.bio || 'This member hasn’t added a bio yet.';

              return (
                <article
                  key={person._id}
                  className="neon-border relative overflow-hidden rounded-3xl bg-surface/80 p-6 shadow-[0_32px_80px_-46px_rgba(7,12,31,0.9)] transition hover:-translate-y-1 hover:shadow-[0_40px_90px_-42px_rgba(0,245,255,0.25)]"
                >
                  <div className="pointer-events-none absolute -top-20 right-0 h-36 w-36 rounded-full bg-neonCyan/10 blur-3xl" />
                  <div className="relative flex items-start gap-4">
                    <Avatar
                      src={
                        person.profilePicture ??
                        person.googlePhotoUrl ??
                        undefined
                      }
                      alt={person.name}
                      className="h-14 w-14 cursor-pointer border border-white/15"
                      onClick={() => openProfile(person._id)}
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openProfile(person._id)}
                          className="text-left text-base font-semibold text-white hover:text-neonCyan"
                        >
                          {person.name}
                        </button>
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/10 px-2 py-0.5 text-[11px] uppercase tracking-wider text-white/70">
                          {roleLabel}
                        </span>
                        {person.points ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-neonCyan/30 bg-neonCyan/10 px-2 py-0.5 text-[11px] font-semibold text-neonCyan">
                            <Sparkles className="h-3 w-3" /> {person.points} pts
                          </span>
                        ) : null}
                      </div>

                      <p className="max-h-14 overflow-hidden text-xs text-white/70">
                        {bioCopy}
                      </p>

                      <div className="flex flex-wrap gap-2">
                        {(person.skills ?? []).slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-white/70"
                          >
                            {skill}
                          </span>
                        ))}
                        {person.overlap ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-neonCyan/40 bg-neonCyan/10 px-2 py-1 text-[11px] font-semibold text-neonCyan">
                            <Users className="h-3 w-3" /> {person.overlap}{' '}
                            shared skill
                          </span>
                        ) : null}
                      </div>

                      {relativeTimestamp && (
                        <p className="flex items-center gap-1 text-[11px] text-white/60">
                          <Clock className="h-3.5 w-3.5" /> {timestampPrefix}{' '}
                          {relativeTimestamp}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="relative mt-5">
                    {renderCardActions(activeTab, person._id)}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default ConnectionsPage;
