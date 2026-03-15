import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Training } from '../models/Training';
import { User } from '../models/User';

type TrainingPayload = {
  title: string;
  description: string;
  provider: string;
  skills?: string[];
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  startDate: string;
  price?: number;
  url?: string;
  logoUrl?: string;
  rating?: number;
};

export const getRecommendedTrainings = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const currentUser = await User.findById(req.user?.id);
    if (!currentUser) {
      return res.status(401).json({ error: true, message: 'User not found' });
    }

    // Get user's skills
    const userSkills = currentUser.skills || [];

    // Prefer skill-matched trainings, then gracefully fallback to top-rated entries.
    let trainings =
      userSkills.length > 0
        ? await Training.find({ skills: { $in: userSkills } })
            .sort({ rating: -1, createdAt: -1 })
            .limit(10)
        : [];

    if (trainings.length < 10) {
      const excludedIds = trainings.map((item) => item._id);
      const fallback = await Training.find({ _id: { $nin: excludedIds } })
        .sort({ rating: -1, createdAt: -1 })
        .limit(10 - trainings.length);
      trainings = [...trainings, ...fallback];
    }

    res.json({ data: trainings });
  } catch (err: any) {
    res
      .status(500)
      .json({
        error: true,
        message: 'Failed to fetch trainings',
        details: err.message
      });
  }
};

export const getAllTrainings = async (_req: Request, res: Response) => {
  try {
    const trainings = await Training.find()
      .sort({ startDate: 1, rating: -1 })
      .limit(50);

    res.json({ data: trainings });
  } catch (err: any) {
    res
      .status(500)
      .json({
        error: true,
        message: 'Failed to fetch trainings',
        details: err.message
      });
  }
};

export const saveTraining = async (
  req: AuthRequest<{ id: string }>,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const trainingId = req.params.id;

    const training = await Training.findById(trainingId);
    if (!training) {
      return res
        .status(404)
        .json({ error: true, message: 'Training not found' });
    }

    if (!userId) {
      return res.status(401).json({ error: true, message: 'Unauthorized' });
    }

    const alreadySaved = training.savedBy.some(
      (id) => id.toString() === userId
    );
    if (alreadySaved) {
      return res.status(400).json({ error: true, message: 'Already saved' });
    }

    training.savedBy.push(userId as any);
    await training.save();

    res.json({ data: training, message: 'Training saved successfully' });
  } catch (err: any) {
    res
      .status(500)
      .json({
        error: true,
        message: 'Failed to save training',
        details: err.message
      });
  }
};

export const removeSavedTraining = async (
  req: AuthRequest<{ id: string }>,
  res: Response
) => {
  try {
    const userId = req.user?.id;
    const trainingId = req.params.id;

    const training = await Training.findById(trainingId);
    if (!training) {
      return res
        .status(404)
        .json({ error: true, message: 'Training not found' });
    }

    if (!userId) {
      return res.status(401).json({ error: true, message: 'Unauthorized' });
    }

    training.savedBy = training.savedBy.filter(
      (id) => id.toString() !== userId
    );
    await training.save();

    res.json({ data: training, message: 'Training removed from saved' });
  } catch (err: any) {
    res
      .status(500)
      .json({
        error: true,
        message: 'Failed to remove training',
        details: err.message
      });
  }
};

export const getSavedTrainings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: true, message: 'Unauthorized' });
    }

    const trainings = await Training.find({ savedBy: userId });

    res.json({ data: trainings });
  } catch (err: any) {
    res
      .status(500)
      .json({
        error: true,
        message: 'Failed to fetch saved trainings',
        details: err.message
      });
  }
};

export const listAdminTrainings = async (
  req: AuthRequest<
    Record<string, unknown>,
    unknown,
    Record<string, unknown>,
    { search?: string; provider?: string; level?: string; limit?: string }
  >,
  res: Response
) => {
  try {
    const { search, provider, level } = req.query;
    const filters: Record<string, unknown> = {};

    if (provider && provider !== 'all') {
      filters.provider = provider;
    }

    if (level && level !== 'all') {
      filters.level = level;
    }

    if (search && search.trim().length > 0) {
      filters.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
        { provider: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const limit = Math.min(Number(req.query.limit ?? 50), 200);

    const [trainings, total] = await Promise.all([
      Training.find(filters).sort({ createdAt: -1 }).limit(limit),
      Training.countDocuments(filters)
    ]);

    res.json({ data: trainings, total });
  } catch (err: any) {
    res
      .status(500)
      .json({
        error: true,
        message: 'Failed to fetch trainings',
        details: err.message
      });
  }
};

export const createTraining = async (
  req: AuthRequest<Record<string, unknown>, unknown, TrainingPayload>,
  res: Response
) => {
  try {
    const payload = req.body;
    const training = await Training.create({
      title: payload.title,
      description: payload.description,
      provider: payload.provider,
      skills: payload.skills ?? [],
      level: payload.level ?? 'intermediate',
      duration: payload.duration,
      startDate: new Date(payload.startDate),
      price: payload.price,
      url: payload.url,
      logoUrl: payload.logoUrl,
      rating: payload.rating
    });

    res.status(201).json(training);
  } catch (err: any) {
    res
      .status(400)
      .json({
        error: true,
        message: 'Failed to create training',
        details: err.message
      });
  }
};

export const updateTraining = async (
  req: AuthRequest<{ id: string }, unknown, Partial<TrainingPayload>>,
  res: Response
) => {
  try {
    const updates: Record<string, unknown> = {};
    const body = req.body;

    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.provider !== undefined) updates.provider = body.provider;
    if (body.skills !== undefined) updates.skills = body.skills;
    if (body.level !== undefined) updates.level = body.level;
    if (body.duration !== undefined) updates.duration = body.duration;
    if (body.startDate !== undefined)
      updates.startDate = new Date(body.startDate);
    if (body.price !== undefined) updates.price = body.price;
    if (body.url !== undefined) updates.url = body.url;
    if (body.logoUrl !== undefined) updates.logoUrl = body.logoUrl;
    if (body.rating !== undefined) updates.rating = body.rating;

    const training = await Training.findByIdAndUpdate(req.params.id, updates, {
      new: true
    });

    if (!training) {
      return res
        .status(404)
        .json({ error: true, message: 'Training not found' });
    }

    res.json(training);
  } catch (err: any) {
    res
      .status(400)
      .json({
        error: true,
        message: 'Failed to update training',
        details: err.message
      });
  }
};

export const deleteTraining = async (
  req: AuthRequest<{ id: string }>,
  res: Response
) => {
  try {
    const training = await Training.findByIdAndDelete(req.params.id);
    if (!training) {
      return res
        .status(404)
        .json({ error: true, message: 'Training not found' });
    }

    res.json({ success: true });
  } catch (err: any) {
    res
      .status(400)
      .json({
        error: true,
        message: 'Failed to delete training',
        details: err.message
      });
  }
};
