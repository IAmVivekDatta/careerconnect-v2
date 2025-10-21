import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { getLeaderboard, awardAchievement } from '../controllers/achievementController';

const router = Router();

router.get('/leaderboard', authMiddleware, getLeaderboard);
router.post('/award', authMiddleware, adminMiddleware, awardAchievement);

export default router;
