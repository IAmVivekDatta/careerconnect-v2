import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { getStats, updateUserRole, deactivateUser, approveOpportunity } from '../controllers/adminController';
import { awardAchievement } from '../controllers/achievementController';

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats', getStats);
router.put('/user/:id/role', updateUserRole);
router.delete('/users/:id', deactivateUser);
router.put('/opportunities/:id/approve', approveOpportunity);
router.post('/achievements/award', awardAchievement);

export default router;
