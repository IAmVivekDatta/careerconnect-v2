import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Opportunity } from '../models/Opportunity';

type UserStatusFilter = 'active' | 'inactive' | 'all';

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

export const listAdminUsers = async (
  req: AuthRequest<Record<string, unknown>, unknown, Record<string, unknown>, { search?: string; role?: string; status?: UserStatusFilter }>,
  res: Response
) => {
  const { search, role } = req.query;
  const status = (req.query.status ?? 'all') as UserStatusFilter;

  const filters: Record<string, unknown> = {};

  if (role && role !== 'all') {
    filters.role = role;
  }

  if (status === 'active') {
    filters.isActive = true;
  } else if (status === 'inactive') {
    filters.isActive = false;
  }

  if (search && search.trim().length > 0) {
    filters.$or = [
      { name: { $regex: search.trim(), $options: 'i' } },
      { email: { $regex: search.trim(), $options: 'i' } }
    ];
  }

  const limit = Math.min(Number((req.query as any).limit ?? 100), 200);

  const [users, total] = await Promise.all([
    User.find(filters)
      .select('_id name email role isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(limit),
    User.countDocuments(filters)
  ]);

  res.json({ data: users, total });
};

export const restoreUser = async (
  req: AuthRequest<{ id: string }> ,
  res: Response
) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: true }, { new: true });
  res.json(user);
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

export const listAdminPosts = async (
  req: AuthRequest<Record<string, unknown>, unknown, Record<string, unknown>, { search?: string; authorId?: string; limit?: string }>,
  res: Response
) => {
  const filters: Record<string, unknown> = {};
  const { search, authorId } = req.query;
  const limit = Math.min(Number(req.query.limit ?? 25), 100);

  if (search && search.trim().length > 0) {
    filters.content = { $regex: search.trim(), $options: 'i' };
  }

  if (authorId) {
    filters.author = authorId;
  }

  const [posts, total] = await Promise.all([
    Post.find(filters)
      .populate('author', '_id name email role')
      .sort({ createdAt: -1 })
      .limit(limit),
    Post.countDocuments(filters)
  ]);

  const normalized = posts.map((post) => ({
    _id: post._id,
    content: post.content,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
    likesCount: post.likes.length,
    commentsCount: post.comments.length,
    author: post.author
  }));

  res.json({ data: normalized, total });
};

export const listAdminOpportunities = async (
  req: AuthRequest<Record<string, unknown>, unknown, Record<string, unknown>, { status?: string; search?: string; limit?: string }>,
  res: Response
) => {
  const { status, search } = req.query;
  const filters: Record<string, unknown> = {};
  const limit = Math.min(Number(req.query.limit ?? 25), 100);

  if (status && status !== 'all') {
    filters.status = status;
  }

  if (search && search.trim().length > 0) {
    filters.$text = { $search: search.trim() };
  }

  const [opportunities, total] = await Promise.all([
    Opportunity.find(filters)
      .populate('postedBy', '_id name email role')
      .sort({ createdAt: -1 })
      .limit(limit),
    Opportunity.countDocuments(filters)
  ]);

  const normalized = opportunities.map((opportunity) => ({
    _id: opportunity._id,
    title: opportunity.title,
    company: opportunity.company,
    status: opportunity.status,
    createdAt: opportunity.createdAt,
    applicantsCount: opportunity.applicants.length,
    postedBy: opportunity.postedBy,
    type: opportunity.type
  }));

  res.json({ data: normalized, total });
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

export const rejectOpportunity = async (
  req: AuthRequest<{ id: string }> ,
  res: Response
) => {
  const opportunity = await Opportunity.findByIdAndUpdate(
    req.params.id,
    { status: 'rejected' },
    { new: true }
  );
  res.json(opportunity);
};
