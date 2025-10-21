import { Schema, model, Document, Types } from 'mongoose';

export interface Comment extends Document {
  user: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface PostDocument extends Document {
  author: Types.ObjectId;
  content: string;
  imageUrl?: string;
  likes: Types.ObjectId[];
  comments: Comment[];
  createdAt: Date;
}

const CommentSchema = new Schema<Comment>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new Schema<PostDocument>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  imageUrl: String,
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: { type: [CommentSchema], default: [] },
  createdAt: { type: Date, default: Date.now }
});

PostSchema.index({ createdAt: -1 });

export const Post = model<PostDocument>('Post', PostSchema);
