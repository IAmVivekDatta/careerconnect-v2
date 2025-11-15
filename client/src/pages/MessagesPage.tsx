import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  Code2,
  ExternalLink,
  FileText,
  Loader2,
  MessageCircle,
  Paperclip,
  Search,
  Send,
  X
} from 'lucide-react';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import { useToast } from '../components/atoms/Toast';
import type { ChatMessage, ConversationSummary } from '../types';
import { useSocket } from '../hooks/useSocket';
import { SOCKET_EVENTS } from '../constants/socketEvents';
import CodeSnippet from '../components/molecules/CodeSnippet';
import {
  isNearBottom,
  shouldFetchNextPage,
  submitMessage,
  validateFileSize
} from './messages/helpers';

const quickReplies = [
  'Thanks for the update! I will review it shortly.',
  'Sharing the code block below. Let me know if you have questions.',
  "Let's hop on a quick call to align our next steps.",
  'Awesome progress—keep it up!'
];

const codeBlockRegex = /```(\w+)?\s*([\s\S]*?)```/m;

const useDebouncedValue = <T,>(value: T, delay = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return debounced;
};

const formatRelativeTime = (value: string) => {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffSeconds = Math.max(Math.floor(diffMs / 1000), 0);
  if (diffSeconds < 60) return 'just now';
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(value).toLocaleDateString();
};

const parseMessageContent = (content: string) => {
  const match = content.match(codeBlockRegex);
  if (!match) {
    return { plainText: content, code: null as string | null, language: undefined as string | undefined };
  }

  const [, language, rawCode] = match;
  const code = rawCode?.trim() ?? '';
  const plainText = content.replace(match[0], '').trim();

  return {
    plainText,
    code,
    language: language?.trim() || 'text'
  };
};

const isImageUrl = (url: string) => {
  const clean = url.split('?')[0].toLowerCase();
  return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].some((ext) => clean.endsWith(ext));
};

const getConversationTitle = (conversation: ConversationSummary, currentUserId?: string) =>
  conversation.participants
    .filter((participant) => participant._id !== currentUserId)
    .map((participant) => participant.name)
    .join(', ') || 'You';

const MessagesPage = () => {
  const { user } = useAuthStore();
  const { push } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [composerValue, setComposerValue] = useState('');
  const [composerMode, setComposerMode] = useState<'text' | 'code'>('text');
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread' | 'attachments'>('all');
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebouncedValue(searchValue);
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToBottom = useRef(true);
  const queryClient = useQueryClient();
  const socket = useSocket();
  const getIsMobile = useCallback(() => (typeof window !== 'undefined' ? window.innerWidth < 1024 : false), []);
  const [isMobile, setIsMobile] = useState(getIsMobile);
  const [showConversationList, setShowConversationList] = useState(() => !getIsMobile());

  const { data: conversations = [], isLoading: conversationsLoading } = useQuery<ConversationSummary[]>(
    {
      queryKey: ['conversations'],
      queryFn: async () => {
        const res = await api.get('/messaging/conversations');
        return res.data ?? [];
      },
      staleTime: 60_000,
      refetchInterval: 90_000
    }
  );

  type MessagePageResponse = { data: ChatMessage[]; page: number; limit: number; total: number };

  const {
    data: messagePages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: messagesLoading
  } = useInfiniteQuery<MessagePageResponse, Error>({
    queryKey: ['messages', selectedConversation],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      if (!selectedConversation) {
        return { data: [], page: 1, limit: 20, total: 0 };
      }
      const res = await api.get(`/messaging/conversations/${selectedConversation}/messages`, {
        params: { page: pageParam, limit: 30 }
      });
      return res.data as MessagePageResponse;
    },
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      if (lastPage.page < totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    enabled: Boolean(selectedConversation),
    refetchInterval: 20_000,
    staleTime: 15_000
  });

  const messages = useMemo(() => {
    if (!messagePages?.pages) return [] as ChatMessage[];
    return messagePages.pages
      .flatMap((page: MessagePageResponse) => page.data)
      .sort(
        (a: ChatMessage, b: ChatMessage) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
  }, [messagePages]);

  const unreadTotal = useMemo(
    () =>
      conversations.reduce((acc, conversation) => {
        const unread = conversation.unreadCount?.[user?._id ?? ''] ?? 0;
        return acc + unread;
      }, 0),
    [conversations, user?._id]
  );

  const attachmentConversations = useMemo(
    () =>
      conversations.filter((conversation) =>
        (conversation.lastMessage?.content ?? '').toLowerCase() === 'attachment'
      ).length,
    [conversations]
  );

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation._id === selectedConversation) ?? null,
    [conversations, selectedConversation]
  );

  const sortedConversations = useMemo(() => {
    const byRecent = [...conversations].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const filtered = byRecent.filter((conversation) => {
      const title = getConversationTitle(conversation, user?._id).toLowerCase();
      const matchesSearch = title.includes(debouncedSearch.toLowerCase());
      if (!matchesSearch) return false;

      if (filter === 'unread') {
        return (conversation.unreadCount?.[user?._id ?? ''] ?? 0) > 0;
      }

      if (filter === 'attachments') {
        return (conversation.lastMessage?.content ?? '').toLowerCase() === 'attachment';
      }

      return true;
    });

    return filtered;
  }, [conversations, debouncedSearch, filter, user?._id]);

  const markAsReadMutation = useMutation({
    mutationFn: (conversationId: string) =>
      api.post(`/messaging/conversations/${conversationId}/read`)
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data as { url: string };
    },
    onError: () => push({ message: 'Failed to upload file. Please try again.', type: 'error' })
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({
      conversationId,
      content,
      attachmentUrl
    }: {
      conversationId: string;
      content: string;
      attachmentUrl?: string;
    }) => {
      const payload = { content, attachmentUrl };
      const res = await api.post(`/messaging/conversations/${conversationId}/messages`, payload);
      return res.data as ChatMessage;
    },
    onSuccess: () => {
      setComposerValue('');
      setPendingFile(null);
      setFilePreview(null);
      shouldStickToBottom.current = true;
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      push({ message: 'Message sent', type: 'success' });
    },
    onError: () => push({ message: 'Failed to send message', type: 'error' })
  });

  const handleSelectConversation = useCallback(
    (conversationId: string) => {
      if (!conversationId) return;
      setSelectedConversation(conversationId);
      shouldStickToBottom.current = true;
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('conversation', conversationId);
        return next;
      });
      markAsReadMutation.mutate(conversationId);
      if (isMobile) {
        setShowConversationList(false);
      }
    },
    [isMobile, markAsReadMutation, setSearchParams]
  );

  useEffect(() => {
    const queryConversation = searchParams.get('conversation');
    const available = sortedConversations.length > 0;

    if (queryConversation) {
      if (selectedConversation !== queryConversation) {
        const exists = sortedConversations.some((conversation) => conversation._id === queryConversation);
        if (exists) {
          handleSelectConversation(queryConversation);
        } else if (available) {
          handleSelectConversation(sortedConversations[0]._id);
        }
      }
      return;
    }

    if (!selectedConversation && available) {
      handleSelectConversation(sortedConversations[0]._id);
    }
  }, [handleSelectConversation, searchParams, selectedConversation, sortedConversations]);

  useEffect(() => {
    if (!messagesContainerRef.current || !shouldStickToBottom.current) return;
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: 'smooth'
    });
  }, [messages.length, selectedConversation]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setIsMobile(getIsMobile());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getIsMobile]);

  useEffect(() => {
    if (!isMobile) {
      setShowConversationList(true);
      return;
    }

    if (selectedConversation) {
      setShowConversationList(false);
    } else {
      setShowConversationList(true);
    }
  }, [isMobile, selectedConversation]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    if (!selectedConversation) {
      return;
    }

    socket.emit('conversation:join', selectedConversation);

    return () => {
      socket.emit('conversation:leave', selectedConversation);
    };
  }, [socket, selectedConversation]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleNewMessage = (message: ChatMessage) => {
      if (!message?.conversationId) {
        return;
      }

      queryClient.setQueryData<InfiniteData<MessagePageResponse>>(
        ['messages', message.conversationId],
        (previous) => {
          if (!previous || previous.pages.length === 0) {
            return previous;
          }

          const alreadyExists = previous.pages.some((page) =>
            page.data.some((item) => item._id === message._id)
          );

          if (alreadyExists) {
            return previous;
          }

          const updatedPages = previous.pages.map((page, index) => {
            if (index === 0) {
              const ordered = [...page.data, message].sort(
                (a: ChatMessage, b: ChatMessage) =>
                  new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
              return {
                ...page,
                data: ordered,
                total: page.total + 1
              };
            }

            return {
              ...page,
              total: page.total + 1
            };
          });

          return {
            ...previous,
            pages: updatedPages
          };
        }
      );

      if (message.conversationId === selectedConversation) {
        if (message.sender._id !== user?._id) {
          markAsReadMutation.mutate(message.conversationId);
        }
      }
    };

    socket.on(SOCKET_EVENTS.CONVERSATION_NEW_MESSAGE, handleNewMessage);

    return () => {
      socket.off(SOCKET_EVENTS.CONVERSATION_NEW_MESSAGE, handleNewMessage);
    };
  }, [socket, queryClient, selectedConversation, user?._id, markAsReadMutation]);

  const panelHeightClass = isMobile ? 'h-[calc(100vh-220px)]' : 'h-[70vh]';

  const handleBackToConversations = () => {
    if (isMobile) {
      setShowConversationList(true);
    }
  };

  useEffect(
    () => () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    },
    [filePreview]
  );

  const handleComposerSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      try {
        const result = await submitMessage({
          conversationId: selectedConversation,
          text: composerValue,
          file: pendingFile,
          upload: (file) => uploadMutation.mutateAsync(file),
          send: (payload) => sendMessageMutation.mutateAsync(payload)
        });

        if (!result.sent && !pendingFile && !composerValue.trim()) {
          push({ message: 'Add text or attach a file before sending.', type: 'error' });
        }
      } catch (error) {
        if (error instanceof Error) {
          push({ message: error.message, type: 'error' });
        } else {
          push({ message: 'Unable to send message. Please try again.', type: 'error' });
        }
      }
    },
    [composerValue, pendingFile, push, selectedConversation, sendMessageMutation, uploadMutation]
  );

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const target = event.currentTarget;
      const metrics = {
        scrollTop: target.scrollTop,
        scrollHeight: target.scrollHeight,
        clientHeight: target.clientHeight
      };

      shouldStickToBottom.current = isNearBottom(metrics);

      if (shouldFetchNextPage(metrics) && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  const handleFilePick = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!validateFileSize(file)) {
      push({ message: 'File size limited to 5MB.', type: 'error' });
      return;
    }
    setPendingFile(file);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }
    if (file.type.startsWith('image/')) {
      setFilePreview(URL.createObjectURL(file));
    } else {
      setFilePreview(null);
    }
  };

  const handleClearAttachment = () => {
    if (filePreview) URL.revokeObjectURL(filePreview);
    setPendingFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) {
    return (
      <section className="flex h-full items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-neonCyan" aria-label="Loading user" />
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">Inbox</h2>
        {!isMobile && (
          <>
            <p className="text-sm text-white/70">
              Share updates, snippets, and files with your network in real time.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              <article className="neon-border rounded-lg bg-surface/80 p-3 text-sm text-white/70">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Conversations</p>
                <p className="mt-1 text-2xl font-semibold text-white">{conversations.length}</p>
              </article>
              <article className="neon-border rounded-lg bg-surface/80 p-3 text-sm text-white/70">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Unread</p>
                <p className="mt-1 text-2xl font-semibold text-neonCyan">{unreadTotal}</p>
              </article>
              <article className="neon-border rounded-lg bg-surface/80 p-3 text-sm text-white/70">
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">Attachments</p>
                <p className="mt-1 text-2xl font-semibold text-neonMagenta">{attachmentConversations}</p>
              </article>
            </div>
          </>
        )}
      </header>

      <div className={`grid gap-4 ${!isMobile ? 'lg:grid-cols-[320px_minmax(0,1fr)]' : ''}`}>
        {(!isMobile || showConversationList) && (
          <aside className={`neon-border flex ${panelHeightClass} flex-col rounded-xl bg-surface/80 p-4 ${isMobile ? 'relative' : ''}`}>
          <div className="mb-4 space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search teammates"
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/40 focus:border-neonCyan focus:outline-none"
              />
            </div>
            <div className="flex gap-2 text-xs">
              {([
                { key: 'all', label: 'All' },
                { key: 'unread', label: 'Unread' },
                { key: 'attachments', label: 'Attachments' }
              ] as const).map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => setFilter(option.key)}
                  className={`rounded-full px-3 py-1 font-medium transition ${
                    filter === option.key
                      ? 'bg-neonCyan text-black'
                      : 'border border-white/10 bg-white/5 text-white/70 hover:border-neonCyan/40'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-1">
            {conversationsLoading ? (
              <div className="flex h-full items-center justify-center text-sm text-white/60">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading conversations…
              </div>
            ) : sortedConversations.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-white/60">
                <MessageCircle className="h-6 w-6" />
                <p>No conversations yet. Start by reaching out from a profile.</p>
              </div>
            ) : (
              <ul className="space-y-2">
                {sortedConversations.map((conversation) => {
                  const unread = conversation.unreadCount?.[user._id] ?? 0;
                  const isActive = selectedConversation === conversation._id;
                  const title = getConversationTitle(conversation, user._id);
                  const preview = conversation.lastMessage?.content ?? 'Say hello 👋';

                  return (
                    <li key={conversation._id}>
                      <button
                        type="button"
                        onClick={() => handleSelectConversation(conversation._id)}
                        className={`w-full rounded-lg border p-3 text-left transition ${
                          isActive
                            ? 'border-neonCyan bg-neonCyan/20'
                            : 'border-white/10 bg-white/5 hover:border-neonCyan/30 hover:bg-white/10'
                        }`}
                      >
                        <p className="flex items-center justify-between text-sm font-semibold text-white">
                          <span className="truncate">{title}</span>
                          <span className="text-xs font-normal text-white/50">
                            {formatRelativeTime(conversation.updatedAt)}
                          </span>
                        </p>
                        <p className="mt-1 truncate text-xs text-white/60">{preview}</p>
                        {unread > 0 && (
                          <span className="mt-2 inline-flex items-center rounded-full bg-neonCyan/90 px-2 py-0.5 text-[10px] font-semibold text-black">
                            {unread} unread
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          </aside>
        )}

        {(!isMobile || !showConversationList) && (
          <main className={`neon-border flex ${panelHeightClass} flex-col rounded-xl bg-surface/80`}>
          {selectedConversation ? (
            <>
              <header className="flex items-center justify-between border-b border-white/5 px-5 py-3">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <button
                      type="button"
                      onClick={handleBackToConversations}
                      className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 transition hover:border-neonCyan/60 hover:text-white"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Inbox
                    </button>
                  )}
                  <h3 className="text-lg font-semibold text-white">
                    {activeConversation
                      ? getConversationTitle(activeConversation, user._id)
                      : 'Conversation'}
                  </h3>
                  <p className="text-xs text-white/60">
                    Attach images, documents, or code blocks using <code className="rounded bg-black/40 px-1">```language</code>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/60">
                  {isFetchingNextPage && <Loader2 className="h-4 w-4 animate-spin text-neonCyan" />}
                  <span>{messages.length} messages</span>
                </div>
              </header>

              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 space-y-4 overflow-y-auto px-5 py-4"
              >
                {messagesLoading ? (
                  <div className="flex h-full items-center justify-center text-sm text-white/60">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading thread…
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-white/60">
                    <MessageCircle className="h-8 w-8" />
                    <p>Kick off the conversation with a quick note or paste a code snippet.</p>
                  </div>
                ) : (
                  messages.map((message: ChatMessage) => {
                    const isOwn = message.sender._id === user._id;
                    const { plainText, code, language } = parseMessageContent(message.content);
                    const showAttachment = Boolean(message.attachmentUrl);

                    return (
                      <div key={message._id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-xl space-y-3 rounded-2xl border px-4 py-3 text-sm shadow-lg transition ${
                            isOwn
                              ? 'border-neonCyan/40 bg-neonCyan/20 text-white'
                              : 'border-white/10 bg-white/5 text-white/80'
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs text-white/50">
                            <span>{isOwn ? 'You' : message.sender.name}</span>
                            <span>{formatRelativeTime(message.createdAt)}</span>
                          </div>

                          {plainText && <p className="whitespace-pre-line text-sm text-white/90">{plainText}</p>}

                          {code && (
                            <div className="overflow-hidden rounded-lg border border-white/10">
                              <CodeSnippet code={code} language={language} />
                            </div>
                          )}

                          {showAttachment && (
                            <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-sm">
                              {isImageUrl(message.attachmentUrl!) ? (
                                <img
                                  src={message.attachmentUrl!}
                                  alt="Attachment"
                                  className="max-h-60 w-full rounded-md object-contain"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex items-center gap-2 text-white/80">
                                  <FileText className="h-4 w-4" />
                                  <a
                                    href={message.attachmentUrl!}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-1 text-xs text-neonCyan hover:text-neonCyan/80"
                                  >
                                    Open attachment
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                </div>
                              )}
                            </div>
                          )}

                          {!message.isRead && !isOwn && (
                            <p className="text-xs text-neonCyan/80">Delivered · awaiting read</p>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <footer className="border-t border-white/5 px-5 py-4">
                <div className="mb-3 hidden flex-wrap gap-2 sm:flex">
                  {quickReplies.map((reply) => (
                    <button
                      key={reply}
                      type="button"
                      onClick={() => setComposerValue((prev) => (prev ? `${prev}\n${reply}` : reply))}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 transition hover:border-neonCyan/40 hover:text-white"
                    >
                      {reply}
                    </button>
                  ))}
                </div>

                {pendingFile && (
                  <div className="mb-3 flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3 text-xs text-white/80">
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-4 w-4" />
                      <div>
                        <p className="font-medium text-white">{pendingFile.name}</p>
                        <p>{(pendingFile.size / 1024).toFixed(0)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearAttachment}
                      className="rounded-full border border-white/10 p-1 text-white/50 transition hover:border-neonMagenta/60 hover:text-neonMagenta"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                {filePreview && (
                  <div className="mb-3 overflow-hidden rounded-lg border border-white/10">
                    <img src={filePreview} alt="Attachment preview" className="max-h-48 w-full object-cover" />
                  </div>
                )}

                <form onSubmit={handleComposerSubmit} className="space-y-3">
                  <div className="flex flex-col gap-3 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleFilePick}
                        className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs transition hover:border-neonCyan/40 hover:text-white"
                      >
                        <Paperclip className="h-3 w-3" /> Attach file
                      </button>
                      <button
                        type="button"
                        onClick={() => setComposerMode((prev) => (prev === 'text' ? 'code' : 'text'))}
                        className={`flex items-center gap-1 rounded-full border px-3 py-1 transition ${
                          composerMode === 'code'
                            ? 'border-neonMagenta/60 bg-neonMagenta/20 text-white'
                            : 'border-white/10 bg-white/5 text-white/70 hover:border-neonMagenta/40'
                        }`}
                      >
                        <Code2 className="h-3 w-3" /> {composerMode === 'code' ? 'Code mode' : 'Plain text'}
                      </button>
                    </div>
                    <span className="text-center text-[11px] text-white/50 sm:text-right">
                      Max 5MB · markdown code fences supported
                    </span>
                  </div>

                  <textarea
                    name="messageContent"
                    value={composerValue}
                    onChange={(event) => setComposerValue(event.target.value)}
                    placeholder={
                      composerMode === 'code'
                        ? 'Share code using ```language\n// snippet```'
                        : 'Write a message… markdown code fences supported'
                    }
                    className={`h-28 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-neonCyan focus:outline-none ${
                      composerMode === 'code' ? 'font-mono' : ''
                    }`}
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-white/50">
                      <AlertTriangle className="h-3 w-3" />
                      <span>Sending without text? Attachments alone are fine.</span>
                    </div>
                    <button
                      type="submit"
                      disabled={sendMessageMutation.isPending || uploadMutation.isPending}
                      className="inline-flex items-center gap-2 rounded-full bg-neonCyan px-5 py-2 text-sm font-semibold text-black transition hover:bg-neonCyan/80 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {(sendMessageMutation.isPending || uploadMutation.isPending) && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                      <Send className="h-4 w-4" />
                      Send
                    </button>
                  </div>
                </form>

                <input
                  ref={fileInputRef}
                  type="file"
                  name="messageAttachment"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.zip,.json,.txt,.css,.html,.js,.ts,.tsx,.py,.java,.c,.cpp"
                />
              </footer>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center text-white/60">
              <MessageCircle className="h-10 w-10" />
              <p>Select a conversation from the left to view the message history.</p>
            </div>
          )}
        </main>
        )}
      </div>
    </section>
  );
};

export default MessagesPage;
