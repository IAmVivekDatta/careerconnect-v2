import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import {
  getRecommendedTrainings,
  getAllTrainings,
  saveTraining,
  removeSavedTraining,
  getSavedTrainings,
  listAdminTrainings,
  createTraining,
  updateTraining,
  deleteTraining
} from '../controllers/trainingController';

const router = Router();

// Get recommended trainings (auth required)
router.get('/recommend', authMiddleware, getRecommendedTrainings);

// Get all trainings
router.get('/', getAllTrainings);

// Admin training management (full CRUD)
router.get('/admin', authMiddleware, adminMiddleware, listAdminTrainings);
router.post(
  '/admin',
  authMiddleware,
  adminMiddleware,
  [
    body('title').isString().notEmpty(),
    body('description').isString().notEmpty(),
    body('provider').isString().notEmpty(),
    body('duration').isNumeric(),
    body('startDate').isISO8601(),
    body('level').optional().isIn(['beginner', 'intermediate', 'advanced']),
    body('rating').optional().isFloat({ min: 1, max: 5 }),
    body('skills').optional().isArray()
  ],
  validate,
  createTraining
);
router.put(
  '/admin/:id',
  authMiddleware,
  adminMiddleware,
  [
    body('title').optional().isString().notEmpty(),
    body('description').optional().isString().notEmpty(),
    body('provider').optional().isString().notEmpty(),
    body('duration').optional().isNumeric(),
    body('startDate').optional().isISO8601(),
    body('level').optional().isIn(['beginner', 'intermediate', 'advanced']),
    body('rating').optional().isFloat({ min: 1, max: 5 }),
    body('skills').optional().isArray()
  ],
  validate,
  updateTraining
);
router.delete('/admin/:id', authMiddleware, adminMiddleware, deleteTraining);

// Get user's saved trainings
router.get('/saved', authMiddleware, getSavedTrainings);

// Save a training
router.post('/:id/save', authMiddleware, saveTraining);

// Remove saved training
router.delete('/:id/save', authMiddleware, removeSavedTraining);

export default router;
