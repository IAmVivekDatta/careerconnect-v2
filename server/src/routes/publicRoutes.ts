import { Router } from 'express';
import { getPublicMetrics } from '../controllers/publicController';

const router = Router();

router.get('/metrics', getPublicMetrics);

export default router;
