import { Router } from 'express';
import { body, param } from 'express-validator';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import {
  getLeaderboard,
  getUserBadges,
  awardAchievement,
  endorseSkill,
  getSkillEndorsements,
  removeEndorsement
} from '../controllers/achievementController';

const router = Router();

router.get('/leaderboard', authMiddleware, getLeaderboard);
router.get('/:userId/badges', authMiddleware, getUserBadges);
router.get('/:userId/endorsements', authMiddleware, getSkillEndorsements);
router.post('/award', authMiddleware, adminMiddleware, awardAchievement);
router.post(
  '/:userId/endorse',
  authMiddleware,
  [body('skill').isString().isLength({ min: 1 })],
  validate,
  endorseSkill
);
router.delete('/:userId/endorse/:skill', authMiddleware, removeEndorsement);

export default router;
