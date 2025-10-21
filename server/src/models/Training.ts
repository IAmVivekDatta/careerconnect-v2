import { Schema, model, Document } from 'mongoose';

export interface TrainingDocument extends Document {
  title: string;
  description: string;
  provider: string; // e.g., "Udemy", "Coursera", "LinkedIn Learning"
  skills: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in hours
  startDate: Date;
  price?: number;
  url?: string;
  logoUrl?: string;
  rating?: number; // 1-5
  savedBy: string[]; // User IDs who saved this training
  createdAt: Date;
}

const TrainingSchema = new Schema<TrainingDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  provider: { type: String, required: true },
  skills: { type: [String], default: [] },
  level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'intermediate' },
  duration: { type: Number, required: true }, // hours
  startDate: { type: Date, required: true },
  price: { type: Number },
  url: { type: String },
  logoUrl: { type: String },
  rating: { type: Number, min: 1, max: 5 },
  savedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

TrainingSchema.index({ skills: 1 });
TrainingSchema.index({ provider: 1 });

export const Training = model<TrainingDocument>('Training', TrainingSchema);
