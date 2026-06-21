import { Quiz } from '../models/Quiz';
import { Attempt } from '../models/Attempt';
import { AppError } from '../utils/AppError';

export async function createQuiz(data: Record<string, unknown>) {
  return Quiz.create(data);
}

export async function updateQuiz(id: string, data: Record<string, unknown>) {
  const quiz = await Quiz.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  if (!quiz) throw new AppError('Quiz not found', 404);
  return quiz;
}

export async function deleteQuiz(id: string) {
  const quiz = await Quiz.findByIdAndDelete(id);
  if (!quiz) throw new AppError('Quiz not found', 404);
  return quiz;
}

export async function getQuizById(id: string) {
  const quiz = await Quiz.findById(id);
  if (!quiz) throw new AppError('Quiz not found', 404);
  return quiz;
}

export async function listQuizzes(filter: Record<string, unknown> = {}, page = 1, limit = 20) {
  const [quizzes, total] = await Promise.all([
    Quiz.find({ isActive: true, ...filter })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Quiz.countDocuments({ isActive: true, ...filter }),
  ]);
  return { quizzes, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function listAllQuizzes(filter: Record<string, unknown> = {}, page = 1, limit = 50) {
  const [quizzes, total] = await Promise.all([
    Quiz.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Quiz.countDocuments(filter),
  ]);
  return { quizzes, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function startAttempt(_userId: string, quizId: string) {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new AppError('Quiz not found', 404);
  return { quiz, startedAt: new Date() };
}

export async function submitAttempt(
  userId: string,
  quizId: string,
  answers: { questionIndex: number; selectedAnswer: number }[],
  timeTaken: number,
) {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new AppError('Quiz not found', 404);

  let score = 0;
  let totalMarks = 0;
  const answered = answers.map((a) => {
    const question = quiz.questions[a.questionIndex];
    if (!question) throw new AppError(`Question at index ${a.questionIndex} not found`, 400);
    const isCorrect = question.correctAnswer === a.selectedAnswer;
    totalMarks += question.marks;
    if (isCorrect) score += question.marks;
    return { questionIndex: a.questionIndex, selectedAnswer: a.selectedAnswer, isCorrect };
  });

  const attempt = await Attempt.create({
    userId,
    quizId,
    quizTitle: quiz.title,
    type: quiz.type,
    category: quiz.category,
    subject: quiz.subject,
    answers: answered,
    score,
    totalMarks,
    percentage: totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0,
    timeTaken,
  });

  return attempt;
}

export async function getAttemptsByUser(userId: string, page = 1, limit = 20) {
  const [attempts, total] = await Promise.all([
    Attempt.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Attempt.countDocuments({ userId }),
  ]);
  return { attempts, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getAttemptById(attemptId: string) {
  const attempt = await Attempt.findById(attemptId);
  if (!attempt) throw new AppError('Attempt not found', 404);
  return attempt;
}

export async function getPerformanceAnalytics(userId: string) {
  const attempts = await Attempt.find({ userId }).lean();
  const byCategory: Record<string, { scores: number[]; count: number }> = {};
  const bySubject: Record<string, { scores: number[]; count: number }> = {};

  for (const a of attempts) {
    const bucket = a.type === 'aptitude' ? byCategory : bySubject;
    const k = a.category || a.subject || 'general';
    if (!bucket[k]) bucket[k] = { scores: [], count: 0 };
    bucket[k].scores.push(a.percentage);
    bucket[k].count++;
  }

  const format = (obj: Record<string, { scores: number[]; count: number }>) =>
    Object.entries(obj).map(([key, val]) => ({
      name: key,
      average: val.scores.length > 0 ? Math.round(val.scores.reduce((a, b) => a + b, 0) / val.scores.length) : 0,
      count: val.count,
    }));

  return {
    totalAttempts: attempts.length,
    overallAverage: attempts.length > 0
      ? Math.round(attempts.reduce((s, a) => s + a.percentage, 0) / attempts.length)
      : 0,
    byCategory: format(byCategory),
    bySubject: format(bySubject),
  };
}
