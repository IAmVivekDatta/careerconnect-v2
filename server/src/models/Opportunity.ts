import { Schema, model, Document, Types } from 'mongoose';

export type OpportunityType = 'Internship' | 'Full-time' | 'Part-time';
export type OpportunityStatus = 'pending' | 'approved' | 'rejected';

export interface OpportunityDocument extends Document {
  title: string;
  company: string;
  description: string;
  type: OpportunityType;
  applyUrl?: string;
  postedBy: Types.ObjectId;
  applicants: Types.ObjectId[];
  status: OpportunityStatus;
  createdAt: Date;
}

const OpportunitySchema = new Schema<OpportunityDocument>({
  title: { type: String, required: true },
  company: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['Internship', 'Full-time', 'Part-time'], required: true },
  applyUrl: String,
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  applicants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

OpportunitySchema.index({ status: 1 });
OpportunitySchema.index({ type: 1 });
OpportunitySchema.index({ createdAt: -1 });
OpportunitySchema.index({ title: 'text', company: 'text', description: 'text' });

export const Opportunity = model<OpportunityDocument>('Opportunity', OpportunitySchema);
