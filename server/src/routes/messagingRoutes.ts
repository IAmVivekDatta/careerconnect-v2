import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import {
  getConversations,
  getOrCreateConversation,
  getConversationMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
  getNotifications,
  markNotificationAsRead
} from '../controllers/messagingController';

const router = Router();

router.use(authMiddleware);

// Conversations
router.get('/conversations', getConversations);
router.get('/conversations/:userId', getOrCreateConversation);
router.get('/conversations/:conversationId/messages', getConversationMessages);
router.post('/conversations/:conversationId/messages', [body('content').isString().isLength({ min: 1 })], validate, sendMessage);
router.post('/conversations/:conversationId/read', markAsRead);

// Notifications
router.get('/unread', getUnreadCount);
router.get('/', getNotifications);
router.post('/:notificationId/read', markNotificationAsRead);

export default router;
