import { Request, Response, NextFunction } from 'express';
import workflowService from '../services/workflow.service';
import { successResponse } from '../utils/response.util';

/**
 * WorkflowController
 * Handles HTTP requests for Workflows, delegating to WorkflowService.
 */
class WorkflowController {
  /**
   * Save (Create/Update) workflow
   */
  public saveWorkflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id, name, nodes, edges } = req.body;

      const workflow = await workflowService.saveWorkflow(
        userId,
        name,
        nodes,
        edges,
        id
      );

      successResponse(res, workflow, id ? 'Workflow updated' : 'Workflow created', id ? 200 : 201);
    } catch (err) {
      next(err);
    }
  };

  /**
   * Load all workflows for user
   */
  public getWorkflows = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const workflows = await workflowService.getUserWorkflows(userId);
      successResponse(res, workflows, 'Workflows retrieved');
    } catch (err) {
      next(err);
    }
  };

  /**
   * Load specific workflow
   */
  public getWorkflowById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      const workflow = await workflowService.getWorkflowById(id as string, userId);
      successResponse(res, workflow, 'Workflow retrieved');
    } catch (err) {
      next(err);
    }
  };

  /**
   * Delete workflow
   */
  public deleteWorkflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user.userId;
      const { id } = req.params;
      await workflowService.deleteWorkflow(id as string, userId);
      successResponse(res, null, 'Workflow deleted');
    } catch (err) {
      next(err);
    }
  };
}

export default new WorkflowController();
