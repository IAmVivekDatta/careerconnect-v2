import { Response } from 'express';
import { Types } from 'mongoose';
import { AuthRequest } from '../middlewares/authMiddleware';
import { User } from '../models/User';
import { Notification } from '../models/Notification';

const USER_SUMMARY_FIELDS = '_id name email profilePicture role skills bio points createdAt';

type ConnectionAction = 'accept' | 'decline';

const toSummary = (user: any) => ({
  _id: String(user._id),
  name: user.name,
  email: user.email,
  profilePicture: user.profilePicture,
  role: user.role,
  skills: user.skills ?? [],
  bio: user.bio,
  points: user.points ?? 0,
  createdAt: user.createdAt
});

const scoreBySkillOverlap = (sourceSkills: string[], candidateSkills: string[]) => {
  if (!sourceSkills.length || !candidateSkills?.length) return 0;
  const set = new Set(sourceSkills.map((s) => s.toLowerCase()));
  return candidateSkills.reduce((acc, skill) => (set.has(skill.toLowerCase()) ? acc + 1 : acc), 0);
};

export const getConnectionOverview = async (
  req: AuthRequest<Record<string, unknown>, unknown, Record<string, unknown>, { summary?: string }>,
  res: Response
) => {
  const currentUser = await User.findById(req.user?.id).select(
    '_id skills connections connectionRequests'
  );

  if (!currentUser) {
    return res.status(404).json({ error: true, message: 'User not found' });
  }

  const summaryOnly = req.query.summary === 'true';

  const connectionIds = (currentUser.connections ?? []).map((id) => new Types.ObjectId(id));
  const incomingRequests = currentUser.connectionRequests ?? [];
  const incomingIds = incomingRequests.map((reqItem) => reqItem.from as Types.ObjectId);

  const outgoingUsers = await User.find({ 'connectionRequests.from': currentUser._id }).select(
    `${USER_SUMMARY_FIELDS} connectionRequests`
  );

  if (summaryOnly) {
    return res.json({
      counts: {
        connections: connectionIds.length,
        pending: incomingIds.length,
        outgoing: outgoingUsers.length
      }
    });
  }

  const [connections, pendingUsers] = await Promise.all([
    connectionIds.length
      ? User.find({ _id: { $in: connectionIds } }).select(USER_SUMMARY_FIELDS)
      : Promise.resolve([]),
    incomingIds.length
      ? User.find({ _id: { $in: incomingIds } }).select(USER_SUMMARY_FIELDS)
      : Promise.resolve([])
  ]);

  const outgoing = outgoingUsers.map((user) => {
    const request = user.connectionRequests.find((reqItem: any) =>
      String(reqItem.from) === String(currentUser._id)
    );
    return {
      ...toSummary(user),
      requestedAt: request?.createdAt ?? user.createdAt
    };
  });

  const incoming = pendingUsers.map((user) => {
    const requestMeta = incomingRequests.find(
      (reqItem) => String(reqItem.from) === String(user._id)
    );
    return {
      ...toSummary(user),
      requestedAt: requestMeta?.createdAt ?? user.createdAt
    };
  });

  const exclusionSet = new Set<string>([
    String(currentUser._id),
    ...connectionIds.map(String),
    ...incomingIds.map(String),
    ...outgoing.map((user) => user._id)
  ]);

  const suggestionPool = await User.find({
    _id: { $nin: Array.from(exclusionSet) },
    role: { $in: ['student', 'alumni'] }
  })
    .select(USER_SUMMARY_FIELDS)
    .limit(50);

  const sourceSkills = currentUser.skills ?? [];
  const rankedSuggestions = suggestionPool
    .map((user) => ({
      summary: toSummary(user),
      overlap: scoreBySkillOverlap(sourceSkills, user.skills ?? [])
    }))
    .sort((a, b) => {
      if (b.overlap !== a.overlap) return b.overlap - a.overlap;
      return new Date(b.summary.createdAt).getTime() - new Date(a.summary.createdAt).getTime();
    })
    .slice(0, 12)
    .map(({ summary, overlap }) => ({ ...summary, overlap }));

  res.json({
    connections: connections.map(toSummary),
    pending: incoming,
    outgoing,
    suggestions: rankedSuggestions,
    counts: {
      connections: connectionIds.length,
      pending: incoming.length,
      outgoing: outgoing.length
    }
  });
};

export const requestConnection = async (
  req: AuthRequest<{ userId: string }> ,
  res: Response
) => {
  const targetId = req.params.userId;
  const currentUserId = req.user?.id;

  if (!currentUserId || !Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({ error: true, message: 'Invalid request' });
  }

  if (targetId === currentUserId) {
    return res.status(400).json({ error: true, message: 'Cannot connect with yourself' });
  }

  const [currentUser, targetUser] = await Promise.all([
    User.findById(currentUserId).select('_id name connections'),
    User.findById(targetId).select('_id name connectionRequests connections')
  ]);

  if (!currentUser || !targetUser) {
    return res.status(404).json({ error: true, message: 'User not found' });
  }

  if (targetUser.connections?.some((connId) => String(connId) === currentUserId)) {
    return res.status(400).json({ error: true, message: 'Already connected' });
  }

  const alreadyRequested = targetUser.connectionRequests?.some(
    (reqItem: any) => String(reqItem.from) === currentUserId
  );
  if (alreadyRequested) {
    return res.status(409).json({ error: true, message: 'Request already sent' });
  }

  await User.findByIdAndUpdate(targetId, {
    $push: {
      connectionRequests: {
        from: currentUser._id,
        createdAt: new Date()
      }
    }
  });

  await Notification.create({
    recipient: targetUser._id,
    actor: currentUser._id,
    type: 'connection-request',
    content: `${currentUser.name} sent you a connection request`,
    relatedId: currentUser._id
  }).catch(() => undefined);

  res.status(201).json({ success: true });
};

export const respondToConnection = async (
  req: AuthRequest<Record<string, unknown>, unknown, { requesterId: string; action: ConnectionAction }> ,
  res: Response
) => {
  const currentUserId = req.user?.id;
  const { requesterId, action } = req.body;

  if (!currentUserId || !Types.ObjectId.isValid(requesterId)) {
    return res.status(400).json({ error: true, message: 'Invalid request' });
  }

  const currentUser = await User.findById(currentUserId).select(
    '_id name connectionRequests connections'
  );

  if (!currentUser) {
    return res.status(404).json({ error: true, message: 'User not found' });
  }

  const hasRequest = currentUser.connectionRequests?.some(
    (reqItem) => String(reqItem.from) === requesterId
  );

  if (!hasRequest) {
    return res.status(404).json({ error: true, message: 'Request not found' });
  }

  await User.findByIdAndUpdate(currentUserId, {
    $pull: { connectionRequests: { from: requesterId } }
  });

  if (action === 'accept') {
    await Promise.all([
      User.findByIdAndUpdate(currentUserId, { $addToSet: { connections: requesterId } }),
      User.findByIdAndUpdate(requesterId, { $addToSet: { connections: currentUserId } })
    ]);
    await Notification.create({
      recipient: requesterId,
      actor: currentUserId,
      type: 'connection-request',
      content: `${currentUser.name} accepted your connection request`,
      relatedId: currentUserId
    }).catch(() => undefined);
  }

  res.json({ success: true, action });
};

export const cancelConnectionRequest = async (
  req: AuthRequest<{ userId: string }> ,
  res: Response
) => {
  const currentUserId = req.user?.id;
  const targetId = req.params.userId;

  if (!currentUserId || !Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({ error: true, message: 'Invalid request' });
  }

  await User.findByIdAndUpdate(targetId, {
    $pull: { connectionRequests: { from: currentUserId } }
  });

  res.json({ success: true });
};

export const removeConnection = async (
  req: AuthRequest<{ userId: string }> ,
  res: Response
) => {
  const currentUserId = req.user?.id;
  const targetId = req.params.userId;

  if (!currentUserId || !Types.ObjectId.isValid(targetId)) {
    return res.status(400).json({ error: true, message: 'Invalid request' });
  }

  await Promise.all([
    User.findByIdAndUpdate(currentUserId, { $pull: { connections: targetId } }),
    User.findByIdAndUpdate(targetId, { $pull: { connections: currentUserId } })
  ]);

  res.json({ success: true });
};
