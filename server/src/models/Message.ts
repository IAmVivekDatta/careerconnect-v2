import { Schema, model, Document, Types } from 'mongoose';

export interface MessageDocument extends Document {
  conversationId: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  attachmentUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

const MessageSchema = new Schema<MessageDocument>({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: '' },
  attachmentUrl: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });

export const Message = model<MessageDocument>('Message', MessageSchema);
