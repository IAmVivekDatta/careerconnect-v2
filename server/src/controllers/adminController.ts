import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Opportunity } from '../models/Opportunity';

export const getStats = async (_req: AuthRequest, res: Response) => {
  const [userCount, activeUsers, postsCount, openJobs] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ updatedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }),
    Post.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
    Opportunity.countDocuments({ status: 'approved' })
  ]);

  res.json({ userCount, activeUsers, postsCount, openJobs });
};

export const updateUserRole = async (
  req: AuthRequest<{ id: string }, unknown, { role: string }>,
  res: Response
) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true });
  res.json(user);
};

export const deactivateUser = async (
  req: AuthRequest<{ id: string }>,
  res: Response
) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  res.json(user);
};

export const approveOpportunity = async (
  req: AuthRequest<{ id: string }>,
  res: Response
) => {
  const opportunity = await Opportunity.findByIdAndUpdate(
    req.params.id,
    { status: 'approved' },
    { new: true }
  );
  res.json(opportunity);
};
