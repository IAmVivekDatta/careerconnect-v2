import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Achievement } from '../models/Achievement';
import { User } from '../models/User';

export const getLeaderboard = async (_req: AuthRequest, res: Response) => {
  const leaderboard = await User.find()
    .sort({ points: -1 })
    .limit(20)
    .select('name points profilePicture');

  res.json(leaderboard);
};

export const awardAchievement = async (
  req: AuthRequest<Record<string, unknown>, unknown, { userId: string; badgeKey: string; points: number }>,
  res: Response
) => {
  const { userId, badgeKey, points } = req.body;

  const achievement = await Achievement.findOne({ key: badgeKey });
  if (!achievement) {
    return res.status(404).json({ error: true, message: 'Achievement not found' });
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $push: {
        badges: {
          key: badgeKey,
          points,
          awardedAt: new Date()
        }
      },
      $inc: { points }
    },
    { new: true }
  );

  res.json(user);
};
