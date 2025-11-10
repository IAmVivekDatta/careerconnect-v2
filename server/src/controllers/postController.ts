import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Post } from '../models/Post';
import { getIO, SOCKET_EVENTS } from '../sockets';

export const createPost = async (req: AuthRequest<Record<string, unknown>, unknown, { content: string; imageUrl?: string }>, res: Response) => {
  try {
    const post = await Post.create({
      author: req.user?.id,
      content: req.body.content,
      imageUrl: req.body.imageUrl
    });

    const populated = await Post.findById(post._id).populate('author', '_id name profilePicture role').populate('comments.user', '_id name profilePicture');
    const io = getIO();
    if (populated && io) {
      io.emit(SOCKET_EVENTS.POST_CREATED, populated);
    }
    res.status(201).json(populated);
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};

export const getFeed = async (req: AuthRequest<Record<string, unknown>, unknown, Record<string, unknown>, { page?: string; limit?: string }>, res: Response) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);

    const posts = await Post.find()
      .populate('author', '_id name profilePicture role')
      .populate('comments.user', '_id name profilePicture')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Post.countDocuments();
    
    res.json({ data: posts, page, limit, total });
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const likePost = async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: req.user?.id } },
      { new: true }
    ).populate('author', '_id name profilePicture role').populate('comments.user', '_id name profilePicture');

    if (!post) {
      return res.status(404).json({ error: true, message: 'Post not found' });
    }

    res.json(post);
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};

export const unlikePost = async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $pull: { likes: req.user?.id } },
      { new: true }
    ).populate('author', '_id name profilePicture role').populate('comments.user', '_id name profilePicture');

    if (!post) {
      return res.status(404).json({ error: true, message: 'Post not found' });
    }

    res.json(post);
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};

export const commentOnPost = async (
  req: AuthRequest<{ id: string }, unknown, { text: string }>,
  res: Response
) => {
  try {
    if (!req.body.text || req.body.text.trim().length === 0) {
      return res.status(400).json({ error: true, message: 'Comment text is required' });
    }

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          comments: {
            user: req.user?.id,
            text: req.body.text.trim(),
            createdAt: new Date()
          }
        }
      },
      { new: true }
    ).populate('author', '_id name profilePicture role').populate('comments.user', '_id name profilePicture');

    if (!post) {
      return res.status(404).json({ error: true, message: 'Post not found' });
    }

    res.json(post);
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};

export const deleteComment = async (
  req: AuthRequest<{ postId: string; commentId: string }>,
  res: Response
) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ error: true, message: 'Post not found' });
    }

    const comment = post.comments.find((c) => String(c._id) === req.params.commentId);
    if (!comment) {
      return res.status(404).json({ error: true, message: 'Comment not found' });
    }

    // Only comment author or admin can delete
    if (String(comment.user) !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Forbidden' });
    }

    const updated = await Post.findByIdAndUpdate(
      req.params.postId,
      { $pull: { comments: { _id: req.params.commentId } } },
      { new: true }
    ).populate('author', '_id name profilePicture role').populate('comments.user', '_id name profilePicture');

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};

export const getPostById = async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', '_id name profilePicture role')
      .populate('comments.user', '_id name profilePicture');
    
    if (!post) {
      return res.status(404).json({ error: true, message: 'Post not found' });
    }

    res.json(post);
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};

export const updatePost = async (req: AuthRequest<{ id: string }, unknown, { content?: string; imageUrl?: string }>, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: true, message: 'Post not found' });
    }

    // only author or admin can update
    if (String((post.author as any)) !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Forbidden' });
    }

    const updates: Record<string, unknown> = {};
    if (req.body.content !== undefined) updates.content = req.body.content;
    if (req.body.imageUrl !== undefined) updates.imageUrl = req.body.imageUrl;

    const updated = await Post.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('author', '_id name profilePicture role')
      .populate('comments.user', '_id name profilePicture');
    
    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};

export const deletePost = async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: true, message: 'Post not found' });
    }

    if (String((post.author as any)) !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Forbidden' });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};
