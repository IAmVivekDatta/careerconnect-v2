import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getRecommendedAlumni, getAlumniDirectory } from '../controllers/alumniController';

const router = Router();

// Get recommended alumni based on user's skills
router.get('/recommend', authMiddleware, getRecommendedAlumni);

// Get full alumni directory
router.get('/directory', getAlumniDirectory);

export default router;
