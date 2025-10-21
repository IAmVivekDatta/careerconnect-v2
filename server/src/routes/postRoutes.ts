import { Router } from 'express';
import { body } from 'express-validator';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { createPost, getFeed, likePost, commentOnPost, getPostById, updatePost, deletePost } from '../controllers/postController';

const router = Router();

router.use(authMiddleware);

router.post('/', [body('content').isString().isLength({ min: 1 })], validate, createPost);
router.get('/', getFeed);
router.get('/:id', getPostById);
router.put('/:id', [body('content').optional().isString().isLength({ min: 1 })], validate, updatePost);
router.delete('/:id', deletePost);
router.post('/:id/like', likePost);
router.post('/:id/comment', commentOnPost);

export default router;
