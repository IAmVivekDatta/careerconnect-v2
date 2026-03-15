import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import {
  getStats,
  updateUserRole,
  deactivateUser,
  approveOpportunity,
  listAdminUsers,
  restoreUser,
  listAdminPosts,
  listAdminOpportunities,
  rejectOpportunity
} from '../controllers/adminController';
import { awardAchievement } from '../controllers/achievementController';
import {
  listAdminFeedback,
  updateFeedbackStatus
} from '../controllers/feedbackController';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats', getStats);
router.get('/users', listAdminUsers);
router.patch('/users/:id/restore', restoreUser);
router.put('/user/:id/role', updateUserRole);
router.delete('/users/:id', deactivateUser);
router.get('/posts', listAdminPosts);
router.get('/opportunities', listAdminOpportunities);
router.put('/opportunities/:id/approve', approveOpportunity);
router.put('/opportunities/:id/reject', rejectOpportunity);
router.get('/feedback', listAdminFeedback);
router.patch('/feedback/:id', updateFeedbackStatus);
router.post('/achievements/award', awardAchievement);

export default router;
