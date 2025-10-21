import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { Notification } from '../models/Notification';
import { Types } from 'mongoose';

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user?.id
    })
      .populate('participants', '_id name profilePicture')
      .sort({ updatedAt: -1 })
      .limit(50);

    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const getOrCreateConversation = async (
  req: AuthRequest<{ userId: string }>,
  res: Response
) => {
  try {
    const otherUserId = req.params.userId;
    const currentUserId = req.user?.id;

    if (otherUserId === currentUserId) {
      return res.status(400).json({ error: true, message: 'Cannot message yourself' });
    }

    // Check if user exists
    const otherUser = await User.findById(otherUserId);
    if (!otherUser) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [currentUserId, otherUserId] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [currentUserId, otherUserId]
      });
    }

    const populated = await conversation.populate('participants', '_id name profilePicture');
    res.json(populated);
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};

export const getConversationMessages = async (
  req: AuthRequest<{ conversationId: string }, Record<string, unknown>, Record<string, unknown>, { page?: string; limit?: string }>,
  res: Response
) => {
  try {
    const { conversationId } = req.params;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: true, message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some((p) => String(p) === req.user?.id);
    if (!isParticipant) {
      return res.status(403).json({ error: true, message: 'Forbidden' });
    }

    const messages = await Message.find({ conversationId })
      .populate('sender', '_id name profilePicture')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Message.countDocuments({ conversationId });

    res.json({
      data: messages.reverse(),
      page,
      limit,
      total
    });
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const sendMessage = async (
  req: AuthRequest<{ conversationId: string }, unknown, { content: string; attachmentUrl?: string }>,
  res: Response
) => {
  try {
    const { conversationId } = req.params;
    const { content, attachmentUrl } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: true, message: 'Message content is required' });
    }

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: true, message: 'Conversation not found' });
    }

    const isParticipant = conversation.participants.some((p) => String(p) === req.user?.id);
    if (!isParticipant) {
      return res.status(403).json({ error: true, message: 'Forbidden' });
    }

    // Create message
    const message = await Message.create({
      conversationId,
      sender: req.user?.id,
      content: content.trim(),
      attachmentUrl
    });

    // Update conversation
    const otherParticipant = conversation.participants.find((p) => String(p) !== req.user?.id);
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        content: content.trim(),
        sender: req.user?.id,
        timestamp: new Date()
      },
      $inc: { [`unreadCount.${String(otherParticipant)}`]: 1 }
    });

    // Create notification
    if (otherParticipant) {
      await Notification.create({
        recipient: otherParticipant,
        actor: req.user?.id,
        type: 'message',
        content: `New message from ${(req.user as any)?.name || 'User'}`,
        relatedId: conversationId
      });
    }

    const populated = await Message.findById(message._id).populate('sender', '_id name profilePicture');
    res.status(201).json(populated);
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};

export const markAsRead = async (
  req: AuthRequest<{ conversationId: string }>,
  res: Response
) => {
  try {
    const { conversationId } = req.params;

    // Mark all messages as read
    await Message.updateMany(
      { conversationId, sender: { $ne: req.user?.id } },
      { isRead: true }
    );

    // Reset unread count
    await Conversation.findByIdAndUpdate(conversationId, {
      [`unreadCount.${req.user?.id}`]: 0
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const unreadCount = await Message.countDocuments({
      isRead: false,
      sender: { $ne: req.user?.id }
    });

    const unreadNotifications = await Notification.countDocuments({
      recipient: req.user?.id,
      isRead: false
    });

    res.json({
      messages: unreadCount,
      notifications: unreadNotifications,
      total: unreadCount + unreadNotifications
    });
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const getNotifications = async (
  req: AuthRequest<Record<string, unknown>, unknown, Record<string, unknown>, { page?: string; limit?: string }>,
  res: Response
) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const notifications = await Notification.find({ recipient: req.user?.id })
      .populate('actor', '_id name profilePicture')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Notification.countDocuments({ recipient: req.user?.id });

    res.json({
      data: notifications,
      page,
      limit,
      total
    });
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const markNotificationAsRead = async (
  req: AuthRequest<{ notificationId: string }>,
  res: Response
) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.notificationId,
      { isRead: true },
      { new: true }
    );

    res.json(notification);
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};
