import { Schema, model, Document, Types } from 'mongoose';

// ── Interfaces ───────────────────────────────────────────────

export interface INode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: any; // This will be encrypted in the DB
}

export interface IEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface IWorkflow extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  nodes: INode[];
  edges: IEdge[];
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ───────────────────────────────────────────────────

const workflowSchema = new Schema<IWorkflow>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    nodes: [
      {
        id: { type: String, required: true },
        type: { type: String },
        position: {
          x: { type: Number, required: true },
          y: { type: Number, required: true },
        },
        data: {
          type: String, // Store as encrypted string
          required: true,
        },
      },
    ],
    edges: [
      {
        id: { type: String, required: true },
        source: { type: String, required: true },
        target: { type: String, required: true },
        label: { type: String },
        animated: { type: Boolean, default: false },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ── Pre-save Hook for Encryption ─────────────────────────────
// Note: We'll manually handle encryption in the service layer 
// for better control and clarity, but hooks are an alternative.

// ── Model ────────────────────────────────────────────────────
const Workflow = model<IWorkflow>('Workflow', workflowSchema);
export default Workflow;
