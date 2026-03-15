import { Schema, model, Document, Types } from 'mongoose';

// ── Interface ──────────────────────────────────────────────
export interface IRefreshToken extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  refreshTokenHash: string;
  isRevoked: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ─────────────────────────────────────────────────
const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      // Indexed via compound schema.index({ userId, isRevoked }) below
    },
    refreshTokenHash: {
      type: String,
      required: true,
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      // Indexed via TTL schema.index() below — no inline index needed
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// ── TTL index: MongoDB automatically deletes expired documents ──
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ── Compound index for fast lookup during token rotation ───
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });

// ── Model ──────────────────────────────────────────────────
const RefreshToken = model<IRefreshToken>('RefreshToken', refreshTokenSchema);
export default RefreshToken;
