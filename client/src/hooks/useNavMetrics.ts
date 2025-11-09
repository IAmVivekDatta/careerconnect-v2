import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../lib/axios";
import useAuthStore from "../store/useAuthStore";
import type { ConnectionCounts, UnreadSummary } from "../types";

const defaultConnectionCounts: ConnectionCounts = {
  connections: 0,
  pending: 0,
  outgoing: 0
};

const defaultUnreadSummary: UnreadSummary = {
  messages: 0,
  notifications: 0,
  total: 0
};

const fetchConnectionCounts = async (): Promise<ConnectionCounts> => {
  const res = await api.get("/connections/overview", {
    params: { summary: "true" }
  });

  return res.data?.counts ?? defaultConnectionCounts;
};

const fetchUnreadSummary = async (): Promise<UnreadSummary> => {
  const res = await api.get("/messaging/unread");
  return res.data ?? defaultUnreadSummary;
};

export const useNavMetrics = () => {
  const { user } = useAuthStore();
  const isAuthenticated = Boolean(user?._id);

  const connectionQuery = useQuery({
    queryKey: ["connections", "overview", "summary"],
    queryFn: fetchConnectionCounts,
    enabled: isAuthenticated,
    staleTime: 60_000,
    refetchInterval: 120_000
  });

  const unreadQuery = useQuery({
    queryKey: ["messaging", "unread"],
    queryFn: fetchUnreadSummary,
    enabled: isAuthenticated,
    staleTime: 30_000,
    refetchInterval: 60_000
  });

  const badges = useMemo(
    () => ({
      connections: connectionQuery.data ?? defaultConnectionCounts,
      unread: unreadQuery.data ?? defaultUnreadSummary
    }),
    [connectionQuery.data, unreadQuery.data]
  );

  return {
    connectionCounts: badges.connections,
    unreadCounts: badges.unread,
    isLoading: connectionQuery.isLoading || unreadQuery.isLoading
  };
};
