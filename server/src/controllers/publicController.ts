import { Request, Response } from 'express';
import { User } from '../models/User';
import { Opportunity } from '../models/Opportunity';
import { Conversation } from '../models/Conversation';

export const getPublicMetrics = async (_req: Request, res: Response) => {
  try {
    const [activeCommunity, mentorshipSessions, verifiedOpenings] =
      await Promise.all([
        User.countDocuments({ isActive: true }),
        Conversation.countDocuments(),
        Opportunity.countDocuments({ status: 'approved' })
      ]);

    res.json({
      activeCommunity,
      mentorshipSessions,
      verifiedOpenings,
      updatedAt: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message });
  }
};
