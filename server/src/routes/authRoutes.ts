import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middlewares/validationMiddleware';
import { login, logout, register, googleSignIn } from '../controllers/authController';

const router = Router();

router.post('/register', [body('name').isString().notEmpty(), body('email').isEmail(), body('password').isLength({ min: 6 })], validate, register);
router.post('/login', [body('email').isEmail(), body('password').isString().notEmpty()], validate, login);
router.post('/logout', logout);
router.post('/google', googleSignIn);

export default router;
