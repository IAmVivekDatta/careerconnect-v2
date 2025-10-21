import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  getRecommendedTrainings,
  getAllTrainings,
  saveTraining,
  removeSavedTraining,
  getSavedTrainings
} from '../controllers/trainingController';

const router = Router();

// Get recommended trainings (auth required)
router.get('/recommend', authMiddleware, getRecommendedTrainings);

// Get all trainings
router.get('/', getAllTrainings);

// Get user's saved trainings
router.get('/saved', authMiddleware, getSavedTrainings);

// Save a training
router.post('/:id/save', authMiddleware, saveTraining);

// Remove saved training
router.delete('/:id/save', authMiddleware, removeSavedTraining);

export default router;
