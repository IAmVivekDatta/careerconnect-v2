import { Schema, model, Document, Types } from 'mongoose';

export type FeedbackKind = 'review' | 'suggestion';
export type FeedbackStatus = 'pending' | 'published' | 'archived';

export interface FeedbackDocument extends Document {
  userId?: Types.ObjectId;
  name: string;
  email?: string;
  kind: FeedbackKind;
  rating?: number;
  message: string;
  status: FeedbackStatus;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema = new Schema<FeedbackDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    kind: {
      type: String,
      enum: ['review', 'suggestion'],
      default: 'review'
    },
    rating: { type: Number, min: 1, max: 5 },
    message: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['pending', 'published', 'archived'],
      default: 'pending'
    },
    adminNote: { type: String }
  },
  { timestamps: true }
);

FeedbackSchema.index({ status: 1, createdAt: -1 });
FeedbackSchema.index({ kind: 1 });

export const Feedback = model<FeedbackDocument>('Feedback', FeedbackSchema);
