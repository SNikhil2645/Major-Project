import { CodingChallenge } from '../models/CodingChallenge';
import { CodingSubmission } from '../models/CodingSubmission';
import { AppError } from '../utils/AppError';

export async function createChallenge(data: Record<string, unknown>) {
  return CodingChallenge.create(data);
}

export async function updateChallenge(id: string, data: Record<string, unknown>) {
  const challenge = await CodingChallenge.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  if (!challenge) throw new AppError('Challenge not found', 404);
  return challenge;
}

export async function deleteChallenge(id: string) {
  const challenge = await CodingChallenge.findByIdAndDelete(id);
  if (!challenge) throw new AppError('Challenge not found', 404);
  return challenge;
}

export async function getChallengeById(id: string, includeTestCases = false) {
  const challenge = await CodingChallenge.findById(id);
  if (!challenge) throw new AppError('Challenge not found', 404);
  if (!includeTestCases) {
    challenge.testCases = challenge.testCases.filter((tc) => !tc.isHidden);
  }
  return challenge;
}

export async function listChallenges(filter: Record<string, unknown> = {}, page = 1, limit = 20) {
  const [challenges, total] = await Promise.all([
    CodingChallenge.find({ isActive: true, ...filter })
      .select('-testCases')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CodingChallenge.countDocuments({ isActive: true, ...filter }),
  ]);
  return { challenges, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function listAllChallenges(filter: Record<string, unknown> = {}, page = 1, limit = 50) {
  const [challenges, total] = await Promise.all([
    CodingChallenge.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    CodingChallenge.countDocuments(filter),
  ]);
  return { challenges, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function submitSolution(
  userId: string,
  challengeId: string,
  code: string,
  language: string,
) {
  const challenge = await CodingChallenge.findById(challengeId);
  if (!challenge) throw new AppError('Challenge not found', 404);

  let passedTestCases = 0;
  const totalTestCases = challenge.testCases.length;

  for (const tc of challenge.testCases) {
    const userOutput = code.includes(tc.expectedOutput.trim()) ? tc.expectedOutput.trim() : '';
    if (userOutput === tc.expectedOutput.trim()) {
      passedTestCases++;
    }
  }

  const status = passedTestCases === totalTestCases && totalTestCases > 0 ? 'correct' : 'incorrect';

  const submission = await CodingSubmission.create({
    userId,
    challengeId,
    challengeTitle: challenge.title,
    code,
    language,
    status,
    passedTestCases,
    totalTestCases,
  });

  return submission;
}

export async function getSubmissionsByUser(userId: string) {
  return CodingSubmission.find({ userId }).sort({ submittedAt: -1 }).lean();
}

export async function getSubmissionsByChallenge(challengeId: string) {
  return CodingSubmission.find({ challengeId }).sort({ submittedAt: -1 }).lean();
}

export async function getUserCodingStats(userId: string) {
  const submissions = await CodingSubmission.find({ userId }).lean();
  const solved = new Set(submissions.filter((s) => s.status === 'correct').map((s) => s.challengeId.toString()));
  return {
    totalSubmissions: submissions.length,
    uniqueSolved: solved.size,
  };
}
