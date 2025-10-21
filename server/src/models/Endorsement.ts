import { Schema, model, Document, Types } from 'mongoose';

export interface EndorsementDocument extends Document {
  skill: string;
  recipient: Types.ObjectId;
  endorser: Types.ObjectId;
  createdAt: Date;
}

const EndorsementSchema = new Schema<EndorsementDocument>({
  skill: { type: String, required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  endorser: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Prevent duplicate endorsements from the same person for the same skill
EndorsementSchema.index({ recipient: 1, endorser: 1, skill: 1 }, { unique: true });

export const Endorsement = model<EndorsementDocument>('Endorsement', EndorsementSchema);
