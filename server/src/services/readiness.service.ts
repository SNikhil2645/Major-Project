import { Attempt } from '../models/Attempt';
import { CodingSubmission } from '../models/CodingSubmission';
import { ReadinessScore } from '../models/ReadinessScore';
import { getLatestResumeAnalysis } from './resume.service';

export async function calculateReadiness(userId: string) {
  const attempts = await Attempt.find({ userId }).lean();
  const aptitudeAttempts = attempts.filter((a) => a.type === 'aptitude');
  const techAttempts = attempts.filter((a) => a.type === 'technical');

  const aptitudeScore = aptitudeAttempts.length > 0
    ? Math.round(aptitudeAttempts.reduce((s, a) => s + a.percentage, 0) / aptitudeAttempts.length)
    : 0;

  const technicalScore = techAttempts.length > 0
    ? Math.round(techAttempts.reduce((s, a) => s + a.percentage, 0) / techAttempts.length)
    : 0;

  const resumeAnalysis = await getLatestResumeAnalysis(userId);
  const resumeScore = resumeAnalysis?.score || 0;

  const submissions = await CodingSubmission.find({ userId }).lean();
  const solvedCount = new Set(submissions.filter((s) => s.status === 'correct').map((s) => s.challengeId.toString())).size;
  const codingScore = Math.min(100, solvedCount * 20);

  const aptitudeWeight = 30;
  const technicalWeight = 25;
  const resumeWeight = 20;
  const codingWeight = 25;

  const overall = Math.round(
    (aptitudeScore * aptitudeWeight +
      technicalScore * technicalWeight +
      resumeScore * resumeWeight +
      codingScore * codingWeight) /
    (aptitudeWeight + technicalWeight + resumeWeight + codingWeight)
  );

  const score = await ReadinessScore.findOneAndUpdate(
    { userId },
    {
      overall,
      aptitude: { score: aptitudeScore, weight: aptitudeWeight },
      technical: { score: technicalScore, weight: technicalWeight },
      resume: { score: resumeScore, weight: resumeWeight },
      coding: { score: codingScore, weight: codingWeight },
      lastUpdated: new Date(),
    },
    { upsert: true, new: true },
  );

  return score;
}

export async function getReadiness(userId: string) {
  let score = await ReadinessScore.findOne({ userId });
  if (!score) {
    score = await calculateReadiness(userId);
  }
  return score;
}
