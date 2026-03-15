import { Schema, model, Document, Types } from 'mongoose';

// ── Interface ──────────────────────────────────────────────
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ── Schema ─────────────────────────────────────────────────
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [60, 'Name must be under 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false, // Never returned in queries by default
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,         // Adds createdAt + updatedAt automatically
    versionKey: false,        // Remove __v field
  },
);

// Note: the unique index on email is created automatically by
// `unique: true` in the field definition above — no schema.index() needed.

// ── Model ──────────────────────────────────────────────────
const User = model<IUser>('User', userSchema);
export default User;
