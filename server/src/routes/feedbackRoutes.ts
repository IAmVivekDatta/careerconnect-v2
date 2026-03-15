import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middlewares/validationMiddleware';
import {
  createFeedback,
  getPublicFeedback
} from '../controllers/feedbackController';

const router = Router();

router.get('/public', getPublicFeedback);
router.post(
  '/',
  [
    body('name').optional().isString().trim().isLength({ min: 2 }),
    body('email').optional().isEmail(),
    body('kind').optional().isIn(['review', 'suggestion']),
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('message').isString().trim().isLength({ min: 8, max: 1200 })
  ],
  validate,
  createFeedback
);

export default router;
