import { Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import { Achievement } from '../models/Achievement';
import { User, type QuestCompletion } from '../models/User';
import { Endorsement } from '../models/Endorsement';

const KNOWN_QUEST_IDS = new Set([
  'share-update',
  'endorse-peer',
  'explore-opportunity',
  'refresh-profile'
]);

const MAX_STORED_QUEST_DAYS = 60;
const MAX_HISTORY_DAYS = 14;

const formatDateKey = (date: Date) => date.toISOString().slice(0, 10);

const parseDateKey = (key: string) => new Date(`${key}T00:00:00.000Z`);

const subtractDays = (key: string, days: number) => {
  const base = parseDateKey(key);
  base.setUTCDate(base.getUTCDate() - days);
  return formatDateKey(base);
};

const trimQuestHistory = (entries: QuestCompletion[], todayKey: string) => {
  const cutoff = subtractDays(todayKey, MAX_STORED_QUEST_DAYS - 1);
  return entries.filter((entry) => entry.date >= cutoff);
};

const computeStreak = (entries: QuestCompletion[], todayKey: string) => {
  if (!entries.length) return 0;
  const uniqueDates = Array.from(new Set(entries.map((entry) => entry.date))).sort();
  const dateSet = new Set(uniqueDates);
  let streak = 0;
  let cursor = todayKey;
  while (dateSet.has(cursor)) {
    streak += 1;
    cursor = subtractDays(cursor, 1);
  }
  return streak;
};

const buildQuestHistory = (entries: QuestCompletion[]) => {
  const grouped: Record<string, string[]> = {};
  for (const entry of entries) {
    if (!grouped[entry.date]) {
      grouped[entry.date] = [];
    }
    if (!grouped[entry.date].includes(entry.questId)) {
      grouped[entry.date].push(entry.questId);
    }
  }

  return grouped;
};

const buildQuestResponse = (
  entries: QuestCompletion[],
  streak: number,
  todayKey: string
) => {
  const history = buildQuestHistory(entries);
  const latestDates = Object.keys(history)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, MAX_HISTORY_DAYS);

  const trimmedHistory: Record<string, string[]> = {};
  for (const dateKey of latestDates) {
    trimmedHistory[dateKey] = history[dateKey];
  }

  return {
    streak,
    completedToday: trimmedHistory[todayKey] ?? [],
    history: trimmedHistory
  };
};

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

export const getQuestProgress = async (req: AuthRequest<{ userId: string }>, res: Response) => {
  try {
    const { userId } = req.params;

    if (req.user?.role !== 'admin' && req.user?.id !== userId) {
      return res.status(403).json({ error: true, message: 'Forbidden' });
    }

    const user = await User.findById(userId).select('achievementProgress');

    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    const todayKey = formatDateKey(new Date());
    let quests: QuestCompletion[] = (user.achievementProgress?.quests ?? [])
      .map((entry) => ({ questId: entry.questId, date: entry.date }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const trimmed = trimQuestHistory(quests, todayKey);

    if (trimmed.length !== quests.length) {
      quests = trimmed.sort((a, b) => a.date.localeCompare(b.date));
      const streak = computeStreak(quests, todayKey);
      user.achievementProgress = {
        quests,
        streak,
        ...(quests.length ? { lastCompletedDate: quests[quests.length - 1].date } : {})
      };
      await user.save();
    }

    const streak = user.achievementProgress?.streak ?? computeStreak(quests, todayKey);
    const responsePayload = buildQuestResponse(quests, streak, todayKey);
    res.json(responsePayload);
  } catch (error: any) {
    res.status(500).json({ error: true, message: error.message });
  }
};

export const toggleQuestCompletion = async (
  req: AuthRequest<{ userId: string }, unknown, { questId: string }>,
  res: Response
) => {
  try {
    const { userId } = req.params;
    const { questId } = req.body;

    if (!questId || !KNOWN_QUEST_IDS.has(questId)) {
      return res.status(400).json({ error: true, message: 'Unknown quest id' });
    }

    if (req.user?.role !== 'admin' && req.user?.id !== userId) {
      return res.status(403).json({ error: true, message: 'Forbidden' });
    }

    const user = await User.findById(userId).select('achievementProgress');

    if (!user) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    const todayKey = formatDateKey(new Date());

    let quests: QuestCompletion[] = (user.achievementProgress?.quests ?? []).map((entry) => ({
      questId: entry.questId,
      date: entry.date
    }));

    const existingIndex = quests.findIndex(
      (entry) => entry.questId === questId && entry.date === todayKey
    );

    if (existingIndex >= 0) {
      quests.splice(existingIndex, 1);
    } else {
      quests.push({ questId, date: todayKey });
    }

    quests = trimQuestHistory(quests, todayKey).sort((a, b) => a.date.localeCompare(b.date));

    const streak = computeStreak(quests, todayKey);
    const latestDate = quests.length
      ? quests.reduce((latest, entry) => (entry.date > latest ? entry.date : latest), quests[0].date)
      : undefined;

    user.achievementProgress = {
      quests,
      streak,
      ...(latestDate ? { lastCompletedDate: latestDate } : {})
    };

    await user.save();

    const responsePayload = buildQuestResponse(quests, streak, todayKey);
    res.json(responsePayload);
  } catch (error: any) {
    res.status(400).json({ error: true, message: error.message });
  }
};
