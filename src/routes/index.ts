import express from 'express';
import authRoutes from './auth.routes';
import workflowRoutes from './workflow.routes';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/workflows', workflowRoutes);

export default router;
