import { Router } from 'express';
import webhookRoutes from './webhooks';

const router = Router();

// Mount webhook routes
router.use('/webhooks', webhookRoutes);

// Future routes will go here
// router.use('/auth', authRoutes);
// router.use('/repositories', repositoryRoutes);
// router.use('/reviews', reviewRoutes);

export default router;