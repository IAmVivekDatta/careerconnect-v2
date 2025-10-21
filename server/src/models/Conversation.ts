import { Schema, model, Document, Types } from 'mongoose';

export interface ConversationDocument extends Document {
  participants: Types.ObjectId[];
  lastMessage?: {
    content: string;
    sender: Types.ObjectId;
    timestamp: Date;
  };
  unreadCount: Map<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new Schema<ConversationDocument>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: {
      content: String,
      sender: { type: Schema.Types.ObjectId, ref: 'User' },
      timestamp: Date
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map()
    }
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ updatedAt: -1 });

export const Conversation = model<ConversationDocument>('Conversation', ConversationSchema);
