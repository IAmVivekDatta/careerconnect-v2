import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Achievement } from '../models/Achievement';
import { User } from '../models/User';
import { Endorsement } from '../models/Endorsement';

export const getLeaderboard = async (_req: AuthRequest, res: Response) => {
  try {
    const leaderboard = await User.find()
      .sort({ points: -1 })
      .limit(20)
      .select('_id name points profilePicture badges');

    res.json(leaderboard);
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const getUserBadges = async (req: AuthRequest<{ userId: string }>, res: Response) => {
  try {
    const user = await User.findById(req.params.userId).select('badges points').populate('badges');

    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    const badges = await Achievement.find({
      key: { $in: user.badges.map((b: any) => b.key) }
    });

    res.json({
      totalPoints: user.points,
      badges: user.badges.map((ub: any) => {
        const badge = badges.find((b) => b.key === ub.key);
        return {
          ...badge?.toObject(),
          awardedAt: ub.awardedAt
        };
      })
    });
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const awardAchievement = async (
  req: AuthRequest<Record<string, unknown>, unknown, { userId: string; badgeKey: string; points: number }>,
  res: Response
) => {
  try {
    // Only admin can award achievements
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Only admin can award achievements' });
    }

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
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};

export const endorseSkill = async (
  req: AuthRequest<{ userId: string }, unknown, { skill: string }>,
  res: Response
) => {
  try {
    const { skill } = req.body;
    const recipientId = req.params.userId;
    const endorserId = req.user?.id;

    if (!skill || skill.trim().length === 0) {
      return res.status(400).json({ error: true, message: 'Skill is required' });
    }

    if (endorserId === recipientId) {
      return res.status(400).json({ error: true, message: 'Cannot endorse yourself' });
    }

    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    if (!recipient.skills.includes(skill)) {
      return res.status(400).json({ error: true, message: 'User does not have this skill' });
    }

    // Create or retrieve endorsement
    let endorsement = await Endorsement.findOne({
      skill,
      recipient: recipientId,
      endorser: endorserId
    });

    if (endorsement) {
      return res.status(400).json({ error: true, message: 'Already endorsed' });
    }

    endorsement = await Endorsement.create({
      skill,
      recipient: recipientId,
      endorser: endorserId
    });

    // Increment endorsement count for recipient
    await User.findByIdAndUpdate(recipientId, { $inc: { points: 5 } });

    res.status(201).json(endorsement);
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: true, message: 'Already endorsed' });
    }
    res.status(400).json({ error: true, message: error.message });
  }
};

export const getSkillEndorsements = async (req: AuthRequest<{ userId: string }>, res: Response) => {
  try {
    const endorsements = await Endorsement.find({ recipient: req.params.userId })
      .populate('endorser', '_id name profilePicture')
      .sort({ createdAt: -1 });

    // Group by skill
    const grouped: Record<string, any[]> = {};
    endorsements.forEach((e) => {
      if (!grouped[e.skill]) {
        grouped[e.skill] = [];
      }
      grouped[e.skill].push(e.endorser);
    });

    res.json(grouped);
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const removeEndorsement = async (
  req: AuthRequest<{ userId: string; skill: string }>,
  res: Response
) => {
  try {
    // Only endorser or admin can remove
    const endorsement = await Endorsement.findOne({
      skill: req.params.skill,
      recipient: req.params.userId
    });

    if (!endorsement) {
      return res.status(404).json({ error: true, message: 'Endorsement not found' });
    }

    if (String(endorsement.endorser) !== req.user?.id && req.user?.role !== 'admin') {
      return res.status(403).json({ error: true, message: 'Forbidden' });
    }

    await Endorsement.deleteOne({
      skill: req.params.skill,
      recipient: req.params.userId,
      endorser: endorsement.endorser
    });

    // Decrement points
    await User.findByIdAndUpdate(req.params.userId, { $inc: { points: -5 } });

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};
