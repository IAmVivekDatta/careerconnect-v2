import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Feedback } from '../models/Feedback';

export const createFeedback = async (
  req: AuthRequest<
    Record<string, unknown>,
    unknown,
    {
      name?: string;
      email?: string;
      kind?: 'review' | 'suggestion';
      rating?: number;
      message: string;
    }
  >,
  res: Response
) => {
  try {
    const { name, email, kind, rating, message } = req.body;

    const feedback = await Feedback.create({
      userId: req.user?.id,
      name: name?.trim() || 'Anonymous User',
      email: email?.trim(),
      kind: kind ?? 'review',
      rating,
      message: message?.trim(),
      status: 'pending'
    });

    res.status(201).json({
      _id: feedback._id,
      message: feedback.message,
      kind: feedback.kind,
      rating: feedback.rating,
      createdAt: feedback.createdAt
    });
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};

export const getPublicFeedback = async (
  req: Request<Record<string, unknown>, unknown, unknown, { limit?: string }>,
  res: Response
) => {
  try {
    const limit = Math.min(Number(req.query.limit ?? 6), 20);

    const feedback = await Feedback.find({ status: 'published' })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('name kind rating message createdAt');

    res.json({ data: feedback });
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const listAdminFeedback = async (
  req: AuthRequest<
    Record<string, unknown>,
    unknown,
    Record<string, unknown>,
    { status?: string; kind?: string; search?: string; limit?: string }
  >,
  res: Response
) => {
  try {
    const { status, kind, search } = req.query;
    const filters: Record<string, unknown> = {};

    if (status && status !== 'all') {
      filters.status = status;
    }

    if (kind && kind !== 'all') {
      filters.kind = kind;
    }

    if (search && search.trim().length > 0) {
      filters.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { message: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const limit = Math.min(Number(req.query.limit ?? 100), 200);

    const [items, total] = await Promise.all([
      Feedback.find(filters).sort({ createdAt: -1 }).limit(limit),
      Feedback.countDocuments(filters)
    ]);

    res.json({ data: items, total });
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const updateFeedbackStatus = async (
  req: AuthRequest<
    { id: string },
    unknown,
    { status?: 'pending' | 'published' | 'archived'; adminNote?: string }
  >,
  res: Response
) => {
  try {
    const updates: Record<string, unknown> = {};
    if (req.body.status) updates.status = req.body.status;
    if (req.body.adminNote !== undefined)
      updates.adminNote = req.body.adminNote;

    const feedback = await Feedback.findByIdAndUpdate(req.params.id, updates, {
      new: true
    });

    if (!feedback) {
      return res
        .status(404)
        .json({ error: true, message: 'Feedback not found' });
    }

    res.json(feedback);
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};
