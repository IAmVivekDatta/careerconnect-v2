import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getMe, updateMe, getUserById, listUsers } from '../controllers/userController';

const router = Router();

router.use(authMiddleware);

router.get('/me', getMe);
router.put('/me', updateMe);
router.get('/:id', getUserById);
router.get('/', listUsers);

export default router;
