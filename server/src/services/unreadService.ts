import { Message } from '../models/Message';
import { Notification } from '../models/Notification';

export interface UnreadSummary {
  messages: number;
  notifications: number;
  total: number;
}

export const getUnreadSummaryForUser = async (userId: string): Promise<UnreadSummary> => {
  const [messages, notifications] = await Promise.all([
    Message.countDocuments({
      isRead: false,
      sender: { $ne: userId }
    }),
    Notification.countDocuments({
      recipient: userId,
      isRead: false
    })
  ]);

  return {
    messages,
    notifications,
    total: messages + notifications
  };
};
