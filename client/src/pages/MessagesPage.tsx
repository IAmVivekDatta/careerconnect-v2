import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import useAuthStore from '../store/useAuthStore';
import { useState } from 'react';
import { useToast } from '../components/atoms/Toast';
import { Send, MessageCircle } from 'lucide-react';

interface Conversation {
  _id: string;
  participants: any[];
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

const MessagesPage = () => {
  const { user } = useAuthStore();
  const { push } = useToast();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await api.get('/messaging/conversations');
      return res.data || [];
    }
  });

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const res = await api.get(`/messaging/conversations/${selectedConversation}/messages`);
      return res.data || [];
    },
    enabled: !!selectedConversation
  });

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConversation || !newMessage.trim()) return;

    try {
      await api.post('/messaging/messages', {
        conversationId: selectedConversation,
        content: newMessage
      });
      setNewMessage('');
      push({ message: 'Message sent', type: 'success' });
    } catch (err) {
      push({ message: 'Failed to send message', type: 'error' });
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-bold">Messages</h2>
        <p className="text-sm text-muted">Chat with other users</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Conversations List */}
        <div className="neon-border rounded-lg bg-surface/80 p-4">
          <h3 className="text-lg font-semibold mb-4">Conversations</h3>
          {isLoading ? (
            <p className="text-sm text-muted">Loading conversations...</p>
          ) : conversations.length === 0 ? (
            <p className="text-sm text-muted">No conversations yet</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv: Conversation) => (
                <button
                  key={conv._id}
                  onClick={() => setSelectedConversation(conv._id)}
                  className={`w-full text-left p-3 rounded transition ${
                    selectedConversation === conv._id
                      ? 'bg-neonCyan/20 border border-neonCyan'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <p className="font-medium text-sm truncate">
                    {conv.participants.map(p => p.name).join(', ')}
                  </p>
                  <p className="text-xs text-muted truncate">{conv.lastMessage}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Messages Thread */}
        <div className="lg:col-span-2 neon-border rounded-lg bg-surface/80 p-4 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="flex-1 overflow-y-auto mb-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-muted">
                    <MessageCircle className="w-8 h-8 mr-2" />
                    <span>No messages yet</span>
                  </div>
                ) : (
                  messages.map((msg: any) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.sender._id === user._id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs p-3 rounded-lg ${
                          msg.sender._id === user._id
                            ? 'bg-neonCyan/30 text-white'
                            : 'bg-white/10 text-white/80'
                        }`}
                      >
                        <p className="text-sm font-medium">{msg.sender.name}</p>
                        <p className="text-sm">{msg.content}</p>
                        <p className="text-xs text-white/50 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 rounded px-3 py-2 text-sm text-white placeholder-white/50"
                />
                <button
                  type="submit"
                  className="bg-neonCyan text-black px-4 py-2 rounded font-semibold hover:bg-neonCyan/80 transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted">
              <p>Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MessagesPage;
