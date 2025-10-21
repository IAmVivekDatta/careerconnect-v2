import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Training } from '../models/Training';
import { User } from '../models/User';

export const getRecommendedTrainings = async (req: AuthRequest, res: Response) => {
  try {
    const currentUser = await User.findById(req.user?.id);
    if (!currentUser) {
      return res.status(401).json({ error: true, message: 'User not found' });
    }

    // Get user's skills
    const userSkills = currentUser.skills || [];

    // Find trainings that match user's skills or level
    let query: any = {};
    if (userSkills.length > 0) {
      query.skills = { $in: userSkills };
    }

    const trainings = await Training.find(query)
      .sort({ rating: -1, createdAt: -1 })
      .limit(10);

    res.json({ data: trainings });
  } catch (err: any) {
    res.status(500).json({ error: true, message: 'Failed to fetch trainings', details: err.message });
  }
};

export const getAllTrainings = async (_req: Request, res: Response) => {
  try {
    const trainings = await Training.find()
      .sort({ startDate: 1, rating: -1 })
      .limit(50);

    res.json({ data: trainings });
  } catch (err: any) {
    res.status(500).json({ error: true, message: 'Failed to fetch trainings', details: err.message });
  }
};

export const saveTraining = async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    const userId = req.user?.id;
    const trainingId = req.params.id;

    const training = await Training.findById(trainingId);
    if (!training) {
      return res.status(404).json({ error: true, message: 'Training not found' });
    }

    // Check if already saved
    if (training.savedBy.includes(userId!)) {
      return res.status(400).json({ error: true, message: 'Already saved' });
    }

    // Add user to savedBy
    training.savedBy.push(userId!);
    await training.save();

    res.json({ data: training, message: 'Training saved successfully' });
  } catch (err: any) {
    res.status(500).json({ error: true, message: 'Failed to save training', details: err.message });
  }
};

export const removeSavedTraining = async (req: AuthRequest<{ id: string }>, res: Response) => {
  try {
    const userId = req.user?.id;
    const trainingId = req.params.id;

    const training = await Training.findById(trainingId);
    if (!training) {
      return res.status(404).json({ error: true, message: 'Training not found' });
    }

    // Remove user from savedBy
    training.savedBy = training.savedBy.filter((id) => id.toString() !== userId);
    await training.save();

    res.json({ data: training, message: 'Training removed from saved' });
  } catch (err: any) {
    res.status(500).json({ error: true, message: 'Failed to remove training', details: err.message });
  }
};

export const getSavedTrainings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const trainings = await Training.find({ savedBy: userId });

    res.json({ data: trainings });
  } catch (err: any) {
    res.status(500).json({ error: true, message: 'Failed to fetch saved trainings', details: err.message });
  }
};
