import { Router } from 'express';
import webhookRoutes from './webhooks';
import reviewRoutes from './reviews';

const router = Router();

// Mount routes
router.use('/webhooks', webhookRoutes);
router.use('/reviews', reviewRoutes);

export default router;