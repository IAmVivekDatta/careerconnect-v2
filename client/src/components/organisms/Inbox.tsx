import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/axios';
import Avatar from '../atoms/Avatar';
import { Send, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ConversationPreview {
  _id: string;
  participants: Array<{ _id: string; name: string; profilePicture?: string }>;
  lastMessage?: { content: string; timestamp: string };
}

interface Message {
  _id: string;
  content: string;
  sender: { _id: string; name: string; profilePicture?: string };
  isRead: boolean;
  createdAt: string;
}

export const Inbox = () => {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await api.get('/messaging/conversations');
      return response.data as ConversationPreview[];
    }
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', selectedConversation],
    queryFn: async () => {
      if (!selectedConversation) return [];
      const response = await api.get(`/messaging/conversations/${selectedConversation}/messages`);
      return response.data.data as Message[];
    },
    enabled: !!selectedConversation
  });

  const sendMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post(
        `/messaging/conversations/${selectedConversation}/messages`,
        { content: messageText }
      );
      return response.data;
    },
    onSuccess: () => {
      setMessageText('');
      queryClient.invalidateQueries({ queryKey: ['messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  const handleSendMessage = () => {
    if (messageText.trim()) {
      sendMutation.mutate();
    }
  };

  const currentConversation = conversations?.find((c) => c._id === selectedConversation);
  const otherParticipant = currentConversation?.participants.find(
    (p) => p._id !== (currentConversation.participants[0]._id === localStorage.getItem('userId') ? currentConversation.participants[0]._id : currentConversation.participants[1]._id)
  );

  return (
    <div className="flex gap-4 h-screen max-h-screen">
      {/* Conversations List */}
      <div className="w-80 bg-gradient-to-br from-slate-900 to-slate-800 border-r border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white mb-3">Messages</h2>
          <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all">
            <Plus className="w-4 h-4" />
            New Message
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationsLoading ? (
            <div className="p-4 text-center text-slate-400">Loading...</div>
          ) : conversations && conversations.length > 0 ? (
            conversations.map((conv) => {
              const isSelected = conv._id === selectedConversation;
              const otherUser = conv.participants[0]; // Simplified for demo

              return (
                <button
                  key={conv._id}
                  onClick={() => setSelectedConversation(conv._id)}
                  className={`w-full p-3 flex gap-3 border-l-4 transition-all ${
                    isSelected
                      ? 'border-l-cyan-500 bg-slate-800 border-b border-slate-700'
                      : 'border-l-transparent hover:bg-slate-800/50 border-b border-slate-700/50'
                  }`}
                >
                  <Avatar src={otherUser.profilePicture} alt={otherUser.name} />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{otherUser.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {conv.lastMessage?.content || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-slate-400 text-sm">No conversations yet</div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      {selectedConversation ? (
        <div className="flex-1 bg-gradient-to-br from-slate-950 to-slate-900 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar src={otherParticipant?.profilePicture} alt={otherParticipant?.name || 'User'} />
              <div>
                <p className="text-sm font-bold text-white">{otherParticipant?.name}</p>
                <p className="text-xs text-slate-400">Active now</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messagesLoading ? (
              <div className="text-center text-slate-400">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-slate-400 text-sm">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex ${msg.sender._id === localStorage.getItem('userId') ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      msg.sender._id === localStorage.getItem('userId')
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                        : 'bg-slate-800 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">{new Date(msg.createdAt).toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-slate-700 flex gap-2">
            <input
              type="text"
              placeholder="Type a message..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sendMutation.isPending}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white p-2 rounded-lg disabled:opacity-50 transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 bg-gradient-to-br from-slate-950 to-slate-900 flex items-center justify-center text-slate-400">
          <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
};
