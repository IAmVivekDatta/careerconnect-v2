import { Router } from 'express';
import { uploadFile } from '../controllers/uploadController';
import { uploadMiddleware } from '../middlewares/uploadMiddleware';

const router = Router();

// single file under field name 'file'
router.post('/', uploadMiddleware.single('file'), uploadFile);

export default router;
