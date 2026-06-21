import { Attempt } from '../models/Attempt';
import { CodingSubmission } from '../models/CodingSubmission';
import { CodingChallenge } from '../models/CodingChallenge';
import { Quiz } from '../models/Quiz';
import { User } from '../models/User';
import { Resource } from '../models/Resource';
import { getLatestResumeAnalysis } from './resume.service';
import { getReadiness } from './readiness.service';
import { getRecentActivity } from './activity.service';

export async function getStudentDashboard(userId: string) {
  const [attempts, submissions, resumeAnalysis, readiness, recentActivity] = await Promise.all([
    Attempt.find({ userId }).lean(),
    CodingSubmission.find({ userId }).lean(),
    getLatestResumeAnalysis(userId),
    getReadiness(userId),
    getRecentActivity(userId, 5),
  ]);

  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
    : 0;

  const solvedSet = new Set(submissions.filter((s) => s.status === 'correct').map((s) => s.challengeId.toString()));

  return {
    quizzesAttempted: attempts.length,
    averageScore: avgScore,
    codingSolved: solvedSet.size,
    resumeScore: resumeAnalysis?.score ?? null,
    readinessScore: readiness?.overall ?? null,
    recentActivity,
  };
}

export async function getAdminStats() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    totalQuizzes,
    totalCodingChallenges,
    totalResources,
    totalAttempts,
    recentRegistrations,
    attempts,
  ] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    Quiz.countDocuments(),
    CodingChallenge.countDocuments(),
    Resource.countDocuments(),
    Attempt.countDocuments(),
    User.countDocuments({ role: 'student', createdAt: { $gte: weekAgo } }),
    Attempt.find().sort({ createdAt: -1 }).limit(100).lean(),
  ]);

  const avgQuizScore = attempts.length > 0
    ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
    : 0;

  const userScores: Record<string, { total: number; count: number }> = {};
  for (const a of attempts) {
    const uid = a.userId.toString();
    if (!userScores[uid]) userScores[uid] = { total: 0, count: 0 };
    userScores[uid].total += a.percentage;
    userScores[uid].count++;
  }

  const userIds = Object.keys(userScores);
  const users = await User.find({ _id: { $in: userIds } }).lean();
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const topPerformers = Object.entries(userScores)
    .map(([uid, val]) => {
      const u = userMap.get(uid);
      return {
        _id: uid,
        name: u?.name || 'Unknown',
        email: u?.email || '',
        averageScore: Math.round(val.total / val.count),
      };
    })
    .filter((p) => p.averageScore > 0)
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 10);

  return {
    totalUsers,
    totalQuizzes,
    totalCodingChallenges,
    totalResources,
    totalAttempts,
    recentRegistrations,
    averageQuizScore: avgQuizScore,
    topPerformers,
  };
}
