import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Opportunity } from '../models/Opportunity';

export const createOpportunity = async (
  req: AuthRequest<Record<string, unknown>, unknown, { title: string; company: string; description: string; type: string; applyUrl?: string }>,
  res: Response
) => {
  const opportunity = await Opportunity.create({
    title: req.body.title,
    company: req.body.company,
    description: req.body.description,
    type: req.body.type,
    applyUrl: req.body.applyUrl,
    postedBy: req.user?.id
  });

  res.status(201).json(opportunity);
};

export const listOpportunities = async (
  req: AuthRequest<Record<string, unknown>, unknown, Record<string, unknown>, { type?: string; approved?: string; search?: string }>,
  res: Response
) => {
  const filters: Record<string, unknown> = {};
  if (req.query.type) filters.type = req.query.type;
  if (req.query.approved === 'true') filters.status = 'approved';

  const search = req.query.search;
  if (search) {
    filters.$text = { $search: search };
  }

  const opportunities = await Opportunity.find(filters).sort({ createdAt: -1 });
  res.json(opportunities);
};

export const getOpportunity = async (req: AuthRequest<{ id: string }>, res: Response) => {
  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity) {
    return res.status(404).json({ error: true, message: 'Opportunity not found' });
  }
  res.json(opportunity);
};

export const applyToOpportunity = async (
  req: AuthRequest<{ id: string }, unknown, { resumeUrl: string }>,
  res: Response
) => {
  const opportunity = await Opportunity.findByIdAndUpdate(
    req.params.id,
    {
      $addToSet: {
        applicants: req.user?.id
      }
    },
    { new: true }
  );

  res.json(opportunity);
};

export const updateOpportunity = async (
  req: AuthRequest<{ id: string }, unknown, { title?: string; company?: string; description?: string; type?: string; applyUrl?: string }>,
  res: Response
) => {
  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity) return res.status(404).json({ error: true, message: 'Opportunity not found' });

  // only poster or admin can update
  if (String((opportunity.postedBy as any)) !== req.user?.id && req.user?.role !== 'admin') {
    return res.status(403).json({ error: true, message: 'Forbidden' });
  }

  const updates: Record<string, unknown> = {};
  const bodyAny = req.body as any;
  ['title', 'company', 'description', 'type', 'applyUrl'].forEach((f) => {
    if (bodyAny[f] !== undefined) updates[f] = bodyAny[f];
  });

  const updated = await Opportunity.findByIdAndUpdate(req.params.id, updates, { new: true });
  res.json(updated);
};

export const deleteOpportunity = async (req: AuthRequest<{ id: string }>, res: Response) => {
  const opportunity = await Opportunity.findById(req.params.id);
  if (!opportunity) return res.status(404).json({ error: true, message: 'Opportunity not found' });

  if (String((opportunity.postedBy as any)) !== req.user?.id && req.user?.role !== 'admin') {
    return res.status(403).json({ error: true, message: 'Forbidden' });
  }

  await Opportunity.findByIdAndDelete(req.params.id);
  res.json({ success: true });
};
