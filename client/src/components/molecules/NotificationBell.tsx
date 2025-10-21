import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { Bell, X } from 'lucide-react';

interface Notification {
  _id: string;
  type: string;
  content: string;
  actor: { _id: string; name: string; profilePicture?: string };
  isRead: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  onUnreadChange?: (count: number) => void;
}

export const NotificationBell = ({ onUnreadChange }: NotificationBellProps) => {
  const { data: unread } = useQuery({
    queryKey: ['unreadCount'],
    queryFn: async () => {
      const response = await api.get('/messaging/unread');
      return response.data;
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await api.get('/messaging?limit=5');
      return response.data.data;
    },
    refetchInterval: 30000
  });

  const unreadCount = unread?.total || 0;

  return (
    <div className="relative group">
      <button className="relative p-2 text-slate-300 hover:text-white transition-colors">
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <div className="absolute right-0 top-full mt-2 w-80 bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg border border-slate-700 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="p-4 border-b border-slate-700 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-1 rounded-full font-semibold">
              {unreadCount} new
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-slate-400 text-sm">Loading...</div>
        ) : notifications && notifications.length > 0 ? (
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-700">
            {notifications.map((notif: Notification) => (
              <div
                key={notif._id}
                className={`p-3 hover:bg-slate-800/50 transition-colors text-sm ${
                  notif.isRead ? 'opacity-60' : 'bg-cyan-500/5'
                }`}
              >
                <div className="flex gap-2">
                  {notif.actor.profilePicture && (
                    <img
                      src={notif.actor.profilePicture}
                      alt={notif.actor.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 break-words">{notif.content}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-sm">No notifications</div>
        )}

        <div className="p-3 border-t border-slate-700 text-center">
          <button className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors">
            View all notifications
          </button>
        </div>
      </div>
    </div>
  );
};
