import { Conversation } from '../models/Conversation';
import { Notification } from '../models/Notification';

export interface UnreadSummary {
  messages: number;
  notifications: number;
  total: number;
}

export const getUnreadSummaryForUser = async (
  userId: string
): Promise<UnreadSummary> => {
  const [conversations, notifications] = await Promise.all([
    Conversation.find({ participants: userId }).select('unreadCount'),
    Notification.countDocuments({ recipient: userId, isRead: false })
  ]);

  const messages = conversations.reduce((acc, conversation) => {
    const unread = conversation.unreadCount?.get(userId) ?? 0;
    return acc + unread;
  }, 0);

  return {
    messages,
    notifications,
    total: messages + notifications
  };
};
