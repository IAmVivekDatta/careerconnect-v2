import { Schema, model, Document, Types } from 'mongoose';

export type NotificationType = 'connection-request' | 'message' | 'post-like' | 'comment' | 'endorsement' | 'achievement';

export interface NotificationDocument extends Document {
  recipient: Types.ObjectId;
  actor: Types.ObjectId;
  type: NotificationType;
  content: string;
  relatedId?: Types.ObjectId;
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<NotificationDocument>({
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: ['connection-request', 'message', 'post-like', 'comment', 'endorsement', 'achievement'],
    required: true
  },
  content: { type: String, required: true },
  relatedId: Schema.Types.ObjectId,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });

export const Notification = model<NotificationDocument>('Notification', NotificationSchema);
