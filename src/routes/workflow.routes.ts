import express from 'express';
import workflowController from '../controllers/workflow.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = express.Router();

// All workflow routes require authentication
router.use(authenticate);

router.post('/', workflowController.saveWorkflow);
router.get('/', workflowController.getWorkflows);
router.get('/:id', workflowController.getWorkflowById);
router.delete('/:id', workflowController.deleteWorkflow);

export default router;
