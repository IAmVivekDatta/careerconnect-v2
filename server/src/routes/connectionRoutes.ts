import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  getConnectionOverview,
  requestConnection,
  respondToConnection,
  cancelConnectionRequest,
  removeConnection
} from '../controllers/connectionController';

const router = Router();

router.use(authMiddleware);

router.get('/overview', getConnectionOverview);
router.post('/request/:userId', requestConnection);
router.post('/respond', respondToConnection);
router.delete('/request/:userId', cancelConnectionRequest);
router.delete('/:userId', removeConnection);

export default router;
