import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { User } from '../models/User';

type UpdateProfilePayload = {
  bio?: string;
  skills?: string[];
  education?: unknown[];
  experience?: unknown[];
  portfolioLinks?: string[];
  resumeUrl?: string;
};

export const getMe = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user?.id).select('-password -connectionRequests');
  if (!user) {
    return res.status(404).json({ error: true, message: 'User not found' });
  }

  // Return a sanitized payload to the client
  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    bio: user.bio,
    skills: user.skills,
    education: user.education,
    experience: user.experience,
    profilePicture: user.profilePicture,
    resumeUrl: user.resumeUrl,
    portfolioLinks: user.portfolioLinks,
    connections: user.connections,
    badges: user.badges,
    points: user.points,
    isActive: user.isActive,
    createdAt: user.createdAt
  });
};

export const updateMe = async (req: AuthRequest<Record<string, unknown>, unknown, UpdateProfilePayload>, res: Response) => {
  const allowedFields = ['bio', 'skills', 'education', 'experience', 'portfolioLinks', 'resumeUrl'];
  const updates: Record<string, unknown> = {};

  const bodyAny = req.body as any;
  allowedFields.forEach((field) => {
    if (bodyAny[field] !== undefined) {
      updates[field] = bodyAny[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user?.id, updates, { new: true });

  if (!user) {
    return res.status(404).json({ error: true, message: 'User not found' });
  }

  // Return sanitized user without password
  const sanitized = await User.findById(user._id).select('-password -connectionRequests');
  res.json(sanitized);
};

export const getUserById = async (req: AuthRequest<{ id: string }>, res: Response) => {
  const user = await User.findById(req.params.id).select('-password -connectionRequests');
  if (!user) {
    return res.status(404).json({ error: true, message: 'User not found' });
  }
  res.json(user);
};

export const listUsers = async (
  req: AuthRequest<Record<string, unknown>, unknown, Record<string, unknown>, { role?: string; skill?: string; batch?: string }>,
  res: Response
) => {
  const { role, skill, batch } = req.query;
  const filters: Record<string, unknown> = {};

  if (role) filters.role = role;
  if (skill) filters.skills = skill;
  if (batch) filters['education.year'] = batch;

  const users = await User.find(filters).select('-password');
  res.json(users);
};
