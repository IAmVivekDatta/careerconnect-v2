import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Opportunity } from '../models/Opportunity';

export const createOpportunity = async (
  req: AuthRequest<
    Record<string, unknown>,
    unknown,
    {
      title: string;
      company: string;
      description: string;
      type: string;
      applyUrl?: string;
      location?: string;
      salary?: string;
      skills?: string[];
    }
  >,
  res: Response
) => {
  const opportunity = await Opportunity.create({
    title: req.body.title,
    company: req.body.company,
    description: req.body.description,
    type: req.body.type,
    applyUrl: req.body.applyUrl,
    location: req.body.location,
    salary: req.body.salary,
    skills: req.body.skills ?? [],
    postedBy: req.user?.id
  });

  res.status(201).json(opportunity);
};

export const listOpportunities = async (
  req: AuthRequest<
    Record<string, unknown>,
    unknown,
    Record<string, unknown>,
    {
      type?: string;
      approved?: string;
      search?: string;
      status?: string;
      applied?: string;
      limit?: string;
      page?: string;
    }
  >,
  res: Response
) => {
  const filters: Record<string, unknown> = {};
  if (req.query.type) filters.type = req.query.type;
  if (req.query.approved === 'true') filters.status = 'approved';
  if (req.query.status && req.query.status !== 'all')
    filters.status = req.query.status;
  if (req.query.applied === 'true' && req.user?.id) {
    filters.applicants = req.user.id;
  }

  const search = req.query.search;
  if (search) {
    filters.$text = { $search: search };
  }

  const limit = Math.min(Number(req.query.limit ?? 50), 100);
  const page = Math.max(Number(req.query.page ?? 1), 1);
  const skip = (page - 1) * limit;

  const opportunities = await Opportunity.find(filters)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const mapped = opportunities.map((opportunity) => {
    const plain = opportunity.toObject();
    const hasApplied =
      req.user?.id != null &&
      opportunity.applicants.some(
        (applicantId) => String(applicantId) === req.user?.id
      );

    return {
      ...plain,
      hasApplied
    };
  });

  res.json(mapped);
};

export const getOpportunity = async (
  req: AuthRequest<{ id: string }>,
  res: Response
) => {
  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity) {
    return res
      .status(404)
      .json({ error: true, message: 'Opportunity not found' });
  }

  const hasApplied =
    req.user?.id != null &&
    opportunity.applicants.some(
      (applicantId) => String(applicantId) === req.user?.id
    );

  res.json({ ...opportunity.toObject(), hasApplied });
};

export const applyToOpportunity = async (
  req: AuthRequest<{ id: string }, unknown, { resumeUrl: string }>,
  res: Response
) => {
  const currentUserId = req.user?.id;
  if (!currentUserId) {
    return res.status(401).json({ error: true, message: 'Unauthorized' });
  }

  const existing = await Opportunity.findById(req.params.id);
  if (!existing) {
    return res
      .status(404)
      .json({ error: true, message: 'Opportunity not found' });
  }

  const alreadyApplied = existing.applicants.some(
    (applicantId) => String(applicantId) === currentUserId
  );
  if (alreadyApplied) {
    return res.status(409).json({ error: true, message: 'Already applied' });
  }

  const opportunity = await Opportunity.findByIdAndUpdate(
    req.params.id,
    {
      $addToSet: {
        applicants: currentUserId
      }
    },
    { new: true }
  );

  res.json({ ...opportunity?.toObject(), hasApplied: true });
};

export const updateOpportunity = async (
  req: AuthRequest<
    { id: string },
    unknown,
    {
      title?: string;
      company?: string;
      description?: string;
      type?: string;
      applyUrl?: string;
      location?: string;
      salary?: string;
      skills?: string[];
    }
  >,
  res: Response
) => {
  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity)
    return res
      .status(404)
      .json({ error: true, message: 'Opportunity not found' });

  // only poster or admin can update
  if (
    String(opportunity.postedBy as any) !== req.user?.id &&
    req.user?.role !== 'admin'
  ) {
    return res.status(403).json({ error: true, message: 'Forbidden' });
  }

  const updates: Record<string, unknown> = {};
  const bodyAny = req.body as any;
  [
    'title',
    'company',
    'description',
    'type',
    'applyUrl',
    'location',
    'salary',
    'skills'
  ].forEach((f) => {
    if (bodyAny[f] !== undefined) updates[f] = bodyAny[f];
  });

  const updated = await Opportunity.findByIdAndUpdate(req.params.id, updates, {
    new: true
  });
  res.json(updated);
};

export const deleteOpportunity = async (
  req: AuthRequest<{ id: string }>,
  res: Response
) => {
  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity)
    return res
      .status(404)
      .json({ error: true, message: 'Opportunity not found' });

  if (
    String(opportunity.postedBy as any) !== req.user?.id &&
    req.user?.role !== 'admin'
  ) {
    return res.status(403).json({ error: true, message: 'Forbidden' });
  }

  await Opportunity.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
