import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Post } from '../models/Post';
import { Types } from 'mongoose';

export const createPost = async (req: AuthRequest<Record<string, unknown>, unknown, { content: string; imageUrl?: string }>, res: Response) => {
  const post = await Post.create({
    author: req.user?.id,
    content: req.body.content,
    imageUrl: req.body.imageUrl
  });

  res.status(201).json(post);
};

export const getFeed = async (req: AuthRequest<Record<string, unknown>, unknown, Record<string, unknown>, { page?: string; limit?: string }>, res: Response) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 20);

  const posts = await Post.find()
    .populate('author', '_id name profilePicture role')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({ data: posts, page, limit });
};

export const likePost = async (req: AuthRequest<{ id: string }>, res: Response) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { likes: req.user?.id } },
    { new: true }
  );
  res.json(post);
};

export const commentOnPost = async (
  req: AuthRequest<{ id: string }, unknown, { text: string }>,
  res: Response
) => {
  const post = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $push: {
        comments: {
          user: req.user?.id,
          text: req.body.text,
          createdAt: new Date()
        }
      }
    },
    { new: true }
  );

  res.json(post);
};

export const getPostById = async (req: AuthRequest<{ id: string }>, res: Response) => {
  const post = await Post.findById(req.params.id).populate('author', '_id name profilePicture role');
  if (!post) return res.status(404).json({ error: true, message: 'Post not found' });
  res.json(post);
};

export const updatePost = async (req: AuthRequest<{ id: string }, unknown, { content?: string; imageUrl?: string }>, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: true, message: 'Post not found' });

  // only author or admin can update
  if (String((post.author as any)) !== req.user?.id && req.user?.role !== 'admin') {
    return res.status(403).json({ error: true, message: 'Forbidden' });
  }

  const updates: Record<string, unknown> = {};
  if (req.body.content !== undefined) updates.content = req.body.content;
  if (req.body.imageUrl !== undefined) updates.imageUrl = req.body.imageUrl;

  const updated = await Post.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json(updated);
};

export const deletePost = async (req: AuthRequest<{ id: string }>, res: Response) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: true, message: 'Post not found' });

  if (String((post.author as any)) !== req.user?.id && req.user?.role !== 'admin') {
    return res.status(403).json({ error: true, message: 'Forbidden' });
  }

  await Post.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
