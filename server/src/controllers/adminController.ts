import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Opportunity } from '../models/Opportunity';

export const getStats = async (_req: AuthRequest, res: Response) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const [
    totalUsers,
    studentCount,
    alumniCount,
    activeUsers30d,
    postsToday,
    totalPosts,
    opportunityPending,
    opportunityApproved,
    opportunityTotal
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'alumni' }),
    User.countDocuments({ updatedAt: { $gte: thirtyDaysAgo } }),
    Post.countDocuments({ createdAt: { $gte: oneDayAgo } }),
    Post.countDocuments(),
    Opportunity.countDocuments({ status: 'pending' }),
    Opportunity.countDocuments({ status: 'approved' }),
    Opportunity.countDocuments()
  ]);

  res.json({
    users: {
      total: totalUsers,
      students: studentCount,
      alumni: alumniCount,
      active30d: activeUsers30d
    },
    posts: {
      total: totalPosts,
      today: postsToday
    },
    opportunities: {
      total: opportunityTotal,
      pending: opportunityPending,
      approved: opportunityApproved
    }
  });
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
