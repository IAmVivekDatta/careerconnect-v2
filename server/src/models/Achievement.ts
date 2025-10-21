import { Schema, model, Document } from 'mongoose';

export interface AchievementDocument extends Document {
  key: string;
  name: string;
  description: string;
  points: number;
}

const AchievementSchema = new Schema<AchievementDocument>({
  key: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, required: true }
});

export const Achievement = model<AchievementDocument>('Achievement', AchievementSchema);
