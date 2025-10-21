import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';

export interface AuthRequest<TParams = Record<string, unknown>, TRes = unknown, TBody = Record<string, unknown>, TQuery = Record<string, unknown>>
  extends Request<TParams, TRes, TBody, TQuery> {
  user?: {
    id: string;
    role: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: true, message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { id: string };
    const user = await User.findById(decoded.id);

    if (!user || !user.isActive) {
      return res.status(401).json({ error: true, message: 'Unauthorized' });
    }

  req.user = { id: String((user as any)._id), role: user.role };
    next();
  } catch (error) {
    return res.status(401).json({ error: true, message: 'Invalid token' });
  }
};
