import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { User } from '../models/User';
import { rankAlumniBySkills } from '../services/alumniService';

export const getRecommendedAlumni = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await User.findById(req.user?.id);
    if (!currentUser) {
      return res.status(401).json({ error: true, message: 'User not found' });
    }

    // Get user's skills
    const userSkills = currentUser.skills || [];
    if (userSkills.length === 0) {
      return res.json({ data: [] }); // No recommendations without skills
    }

    // Fetch all alumni
    const alumni = await User.find({ role: 'alumni' })
      .select('_id name email skills profilePicture bio')
      .limit(50); // Fetch top 50 alumni for ranking

    // Rank by similarity
    const alumniForRanking = alumni.map((alum) => ({
      _id: String(alum._id),
      name: alum.name,
      skills: alum.skills
    }));
    const ranked = rankAlumniBySkills(userSkills, alumniForRanking);

    // Return top 10 with full details
    const topAlumniIds = ranked.slice(0, 10).map((a) => a._id);
    const topAlumni = alumni.filter((a) => topAlumniIds.includes(String(a._id)));

    res.json({ data: topAlumni });
  } catch (err: any) {
    res.status(500).json({ error: true, message: 'Failed to fetch recommendations', details: err.message });
  }
};

export const getAlumniDirectory = async (_req: Request, res: Response) => {
  try {
    const alumni = await User.find({ role: 'alumni' })
      .select('name email skills profilePicture bio experience')
      .sort({ createdAt: -1 });

    res.json({ data: alumni });
  } catch (err: any) {
    res.status(500).json({ error: true, message: 'Failed to fetch alumni', details: err.message });
  }
};
