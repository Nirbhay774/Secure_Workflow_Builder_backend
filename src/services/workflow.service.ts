import Workflow, { IWorkflow, INode } from '../models/Workflow.model';
import EncryptionUtil from '../utils/encryption.util';
import { NotFoundError } from '../errors/AppError';
import { Types } from 'mongoose';

/**
 * WorkflowService
 * Encapsulates all business logic for workflow management,
 * including AES encryption of node data at rest.
 */
class WorkflowService {
  /**
   * Create or Update a workflow for a user
   */
  public async saveWorkflow(
    userId: string,
    name: string,
    nodes: any[],
    edges: any[],
    workflowId?: string
  ): Promise<IWorkflow> {
    // 1. Encrypt sensitive node data
    const encryptedNodes: INode[] = nodes.map((node) => ({
      ...node,
      data: EncryptionUtil.encryptObject(node.data),
    }));

    // 2. Upsert (Update if exists, else create)
    if (workflowId) {
      const updated = await Workflow.findOneAndUpdate(
        { _id: workflowId, userId },
        { name, nodes: encryptedNodes, edges },
        { new: true, runValidators: true }
      );
      if (!updated) throw new NotFoundError('Workflow not found');
      return this.decryptWorkflow(updated);
    }

    const created = await Workflow.create({
      userId: new Types.ObjectId(userId),
      name,
      nodes: encryptedNodes,
      edges,
    });

    return this.decryptWorkflow(created);
  }

  /**
   * Get all workflows for a specific user
   */
  public async getUserWorkflows(userId: string): Promise<IWorkflow[]> {
    const workflows = await Workflow.find({ userId }).sort({ updatedAt: -1 });
    return workflows.map((w) => this.decryptWorkflow(w));
  }

  /**
   * Get a single workflow by ID
   */
  public async getWorkflowById(workflowId: string, userId: string): Promise<IWorkflow> {
    const workflow = await Workflow.findOne({ _id: workflowId, userId });
    if (!workflow) throw new NotFoundError('Workflow not found');
    return this.decryptWorkflow(workflow);
  }

  /**
   * Delete a workflow
   */
  public async deleteWorkflow(workflowId: string, userId: string): Promise<void> {
    const result = await Workflow.deleteOne({ _id: workflowId, userId });
    if (result.deletedCount === 0) throw new NotFoundError('Workflow not found');
  }

  /**
   * Private helper to decrypt a workflow document for the service layer
   */
  private decryptWorkflow(doc: IWorkflow): IWorkflow {
    // Convert Mongoose doc to plain object to modify nodes
    const workflow = doc.toObject() as IWorkflow;
    
    workflow.nodes = workflow.nodes.map((node: any) => ({
      ...node,
      data: EncryptionUtil.decryptObject(node.data),
    }));

    return workflow;
  }
}

export default new WorkflowService();
