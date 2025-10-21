import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../middlewares/authMiddleware';
import { adminMiddleware } from '../middlewares/adminMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { createOpportunity, listOpportunities, getOpportunity, applyToOpportunity, updateOpportunity, deleteOpportunity } from '../controllers/opportunityController';
import { approveOpportunity } from '../controllers/adminController';

const router = Router();

router.get('/', authMiddleware, listOpportunities);
router.get('/:id', authMiddleware, getOpportunity);
router.post('/', authMiddleware, [
	body('title').isString().notEmpty(),
	body('company').isString().notEmpty(),
	body('description').isString().notEmpty(),
	body('type').isIn(['Internship', 'Full-time', 'Part-time'])
], validate, createOpportunity);
router.post('/:id/apply', authMiddleware, applyToOpportunity);
router.put('/:id/approve', authMiddleware, adminMiddleware, approveOpportunity);
router.put('/:id', authMiddleware, [
	body('title').optional().isString().notEmpty(),
	body('company').optional().isString().notEmpty(),
	body('description').optional().isString().notEmpty(),
	body('type').optional().isIn(['Internship', 'Full-time', 'Part-time'])
], validate, updateOpportunity);
router.delete('/:id', authMiddleware, deleteOpportunity);

export default router;
