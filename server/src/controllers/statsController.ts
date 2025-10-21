import { Request, Response } from 'express';
import { User } from '../models/User';
import { Post } from '../models/Post';
import { Opportunity } from '../models/Opportunity';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    // Total users by role
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const alumniCount = await User.countDocuments({ role: 'alumni' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    // Active users (logged in within last 30 days - placeholder for now)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers30d = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Posts metrics
    const totalPosts = await Post.countDocuments();
    const postsToday = await Post.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    });

    // Opportunities metrics
    const totalOpportunities = await Opportunity.countDocuments();
    const pendingApprovals = await Opportunity.countDocuments({ status: 'pending' });
    const approvedOpportunities = await Opportunity.countDocuments({ status: 'approved' });

    res.json({
      users: {
        total: totalUsers,
        students: studentCount,
        alumni: alumniCount,
        admins: adminCount,
        active30d: activeUsers30d
      },
      posts: {
        total: totalPosts,
        today: postsToday
      },
      opportunities: {
        total: totalOpportunities,
        pending: pendingApprovals,
        approved: approvedOpportunities
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: true, message: 'Failed to fetch stats', details: err.message });
  }
};
