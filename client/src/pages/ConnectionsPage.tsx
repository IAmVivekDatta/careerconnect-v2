import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "../lib/axios";
import { ConnectionsOverview } from "../types";
import { useToast } from "../components/atoms/Toast";

type TabKey = "pending" | "connections" | "suggestions" | "outgoing";

const tabLabels: Record<TabKey, string> = {
  connections: "My Network",
  pending: "Requests",
  suggestions: "Suggested",
  outgoing: "Sent"
};

const ConnectionsPage = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { push } = useToast();

  const { data, isLoading, isFetching } = useQuery<ConnectionsOverview>({
    queryKey: ["connections-overview"],
    queryFn: async () => {
      const response = await api.get<ConnectionsOverview>("/connections/overview");
      return response.data;
    },
    staleTime: 1000 * 60
  });

  const respondMutation = useMutation({
    mutationFn: ({ requesterId, action }: { requesterId: string; action: "accept" | "decline" }) =>
      api.post("/connections/respond", { requesterId, action }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections-overview"] });
      push({ message: "Connection updated", type: "success" });
    },
    onError: () => push({ message: "Unable to update request", type: "error" })
  });

  const sendRequestMutation = useMutation({
    mutationFn: (userId: string) => api.post(`/connections/request/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections-overview"] });
      push({ message: "Request sent", type: "success" });
    },
    onError: () => push({ message: "Unable to send request", type: "error" })
  });

  const cancelMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/connections/request/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections-overview"] });
      push({ message: "Request canceled", type: "success" });
    },
    onError: () => push({ message: "Unable to cancel request", type: "error" })
  });

  const removeConnectionMutation = useMutation({
    mutationFn: (userId: string) => api.delete(`/connections/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections-overview"] });
      push({ message: "Connection removed", type: "success" });
    },
    onError: () => push({ message: "Unable to remove connection", type: "error" })
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
    onError: () => push({ message: "Unable to open conversation", type: "error" })
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

  const renderEmptyState = (message: string) => (
    <div className="rounded-lg bg-white/5 p-8 text-center text-sm text-white/60">{message}</div>
  );

  const renderCardActions = (tab: TabKey, userId: string) => {
    if (tab === "pending") {
      return (
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded bg-neonCyan/20 px-3 py-2 text-xs font-semibold text-neonCyan transition hover:bg-neonCyan/30 disabled:opacity-50"
            onClick={() => respondMutation.mutate({ requesterId: userId, action: "accept" })}
            disabled={respondMutation.isPending}
          >
            Accept
          </button>
          <button
            type="button"
            className="flex-1 rounded bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
            onClick={() => respondMutation.mutate({ requesterId: userId, action: "decline" })}
            disabled={respondMutation.isPending}
          >
            Decline
          </button>
        </div>
      );
    }

    if (tab === "connections") {
      return (
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
            onClick={() => openConversationMutation.mutate(userId)}
            disabled={openConversationMutation.isPending}
          >
            Message
          </button>
          <button
            type="button"
            className="rounded bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
            onClick={() => removeConnectionMutation.mutate(userId)}
            disabled={removeConnectionMutation.isPending}
          >
            Remove
          </button>
        </div>
      );
    }

    if (tab === "outgoing") {
      return (
        <div className="flex gap-2">
          <button
            type="button"
            className="flex-1 rounded bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
            onClick={() => openConversationMutation.mutate(userId)}
            disabled={openConversationMutation.isPending}
          >
            Message
          </button>
          <button
            type="button"
            className="rounded bg-yellow-500/10 px-3 py-2 text-xs font-semibold text-yellow-300 transition hover:bg-yellow-500/20 disabled:opacity-50"
            onClick={() => cancelMutation.mutate(userId)}
            disabled={cancelMutation.isPending}
          >
            Cancel
          </button>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <button
          type="button"
          className="flex-1 rounded bg-neonCyan/20 px-3 py-2 text-xs font-semibold text-neonCyan transition hover:bg-neonCyan/30 disabled:opacity-50"
          onClick={() => sendRequestMutation.mutate(userId)}
          disabled={sendRequestMutation.isPending}
        >
          Connect
        </button>
        <button
          type="button"
          className="flex-1 rounded bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
          onClick={() => openConversationMutation.mutate(userId)}
          disabled={openConversationMutation.isPending}
        >
          Message
        </button>
      </div>
    );
  };

  const activeList = tabData[activeTab];

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Connections</h2>
        <p className="text-sm text-muted">Manage requests, nurture relationships, and grow your network.</p>
      </header>

      <nav className="flex flex-wrap gap-2">
        {(Object.keys(tabLabels) as TabKey[]).map((tab) => (
          <button
            key={tab}
            type="button"
            className={`rounded-full px-4 py-2 text-sm transition ${
              activeTab === tab ? 'bg-neonCyan text-black' : 'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabels[tab]}{' '}
            <span className="text-xs text-white/70">
              {tab === 'pending' && counts.pending}
              {tab === 'connections' && counts.connections}
              {tab === 'outgoing' && counts.outgoing}
              {tab === 'suggestions' && (data?.suggestions?.length ?? 0)}
            </span>
          </button>
        ))}
      </nav>

      <div className="space-y-4">
        {isLoading || isFetching ? (
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-lg bg-white/10" />
            ))}
          </div>
        ) : activeList.length === 0 ? (
          renderEmptyState(
            activeTab === 'pending'
              ? 'No incoming requests right now.'
              : activeTab === 'connections'
              ? 'You have not connected with anyone yet.'
              : activeTab === 'outgoing'
              ? 'You have no pending requests.'
              : 'No suggestions available. Update your skills to get better matches.'
          )
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {activeList.map((person) => (
              <article key={person._id} className="neon-border rounded-lg bg-surface/80 p-5 shadow-lg">
                <div className="flex items-start gap-4">
                  <img
                    src={person.profilePicture || `https://i.pravatar.cc/120?u=${person.email}`}
                    alt={person.name}
                    className="h-12 w-12 rounded-full border border-white/10 object-cover"
                  />
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-semibold text-white">{person.name}</h4>
                    <p className="text-xs text-white/60">{person.role === 'alumni' ? 'Alumni' : person.role}</p>
                    <div className="flex flex-wrap gap-1">
                      {person.skills?.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-white/10 px-2 py-1 text-[10px] uppercase tracking-wide text-white/60"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                    {person.overlap ? (
                      <p className="text-[11px] text-neonCyan">{person.overlap} shared skill{person.overlap === 1 ? '' : 's'}</p>
                    ) : null}
                    {person.requestedAt && activeTab !== 'connections' && (
                      <p className="text-[10px] uppercase text-white/40">
                        {activeTab === 'pending' ? 'Requested' : 'Sent'} {new Date(person.requestedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  {renderCardActions(activeTab, person._id)}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ConnectionsPage;
