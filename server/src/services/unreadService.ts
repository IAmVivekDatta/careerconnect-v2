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
    Notification.countDocuments({
      recipient: userId,
      isRead: false
    })
  ]);

  const messages = conversations.reduce((total, conversation) => {
    const unreadForUser = conversation.unreadCount?.get(userId) ?? 0;
    if (!Number.isFinite(unreadForUser) || unreadForUser <= 0) {
      return total;
    }
    return total + unreadForUser;
  }, 0);

  return {
    messages,
    notifications,
    total: messages + notifications
  };
};
