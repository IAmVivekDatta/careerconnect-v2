import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { io, type Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import type { ConversationSummary, Post, UnreadSummary } from '../types';
import { useQueryClient } from '@tanstack/react-query';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

const deriveSocketUrl = (apiBase?: string | null) => {
  if (!apiBase) {
    return window.location.origin;
  }

  try {
    const parsed = new URL(apiBase, window.location.origin);
    const normalizedPath = parsed.pathname.replace(/\/$/, '').replace(/\/api$/, '');
    return `${parsed.origin}${normalizedPath || ''}`;
  } catch (error) {
    console.error('Failed to parse API base URL for sockets', error);
    return window.location.origin;
  }
};

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
  const { token } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  const socketUrl = useMemo(() => deriveSocketUrl(api.defaults.baseURL ?? ''), []);

  useEffect(() => {
    if (!token) {
      if (socket) {
        socket.disconnect();
      }
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const instance = io(socketUrl, {
      withCredentials: true,
      autoConnect: false,
      auth: { token },
      reconnectionAttempts: 5
    });

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);
    const handleConnectError = (error: Error) => {
      console.warn('Socket connect_error', error);
      setIsConnected(false);
    };

    instance.on('connect', handleConnect);
    instance.on('disconnect', handleDisconnect);
    instance.on('connect_error', handleConnectError);

    instance.connect();
    setSocket(instance);

    return () => {
      instance.off('connect', handleConnect);
      instance.off('disconnect', handleDisconnect);
      instance.off('connect_error', handleConnectError);
      instance.disconnect();
    };
  }, [token, socketUrl]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handlePostCreated = (post: Post) => {
      queryClient.setQueryData<{ data: Post[] }>(['feed'], (previous) => {
        if (!previous?.data) {
          return previous;
        }

        if (previous.data.some((existing) => existing._id === post._id)) {
          return previous;
        }

        return {
          ...previous,
          data: [post, ...previous.data]
        };
      });
    };

    const handleConversationUpdated = (conversation: ConversationSummary) => {
      queryClient.setQueryData<ConversationSummary[]>(['conversations'], (previous) => {
        if (!previous || previous.length === 0) {
          return [conversation];
        }

        const copy = [...previous];
        const index = copy.findIndex((existing) => existing._id === conversation._id);
        if (index === -1) {
          copy.unshift(conversation);
          return copy;
        }
        copy[index] = { ...copy[index], ...conversation };
        return copy;
      });
    };

    const handleUnreadSummary = (summary: UnreadSummary) => {
      queryClient.setQueryData<UnreadSummary>(['messaging', 'unread'], summary);
    };

    socket.on(SOCKET_EVENTS.POST_CREATED, handlePostCreated);
    socket.on(SOCKET_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated);
    socket.on(SOCKET_EVENTS.UNREAD_SUMMARY, handleUnreadSummary);

    return () => {
      socket.off(SOCKET_EVENTS.POST_CREATED, handlePostCreated);
      socket.off(SOCKET_EVENTS.CONVERSATION_UPDATED, handleConversationUpdated);
      socket.off(SOCKET_EVENTS.UNREAD_SUMMARY, handleUnreadSummary);
    };
  }, [socket, queryClient]);

  const value = useMemo<SocketContextValue>(
    () => ({ socket, isConnected }),
    [socket, isConnected]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider');
  }
  return context;
};

export default SocketProvider;
