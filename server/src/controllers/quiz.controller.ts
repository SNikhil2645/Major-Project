import { Request, Response } from 'express';
import * as quizService from '../services/quiz.service';
import * as activityService from '../services/activity.service';
import * as readinessService from '../services/readiness.service';
import { asyncHandler } from '../utils/asyncHandler';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await quizService.createQuiz({ ...req.body, createdBy: req.user!.userId });
  res.status(201).json({ success: true, data: quiz });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await quizService.updateQuiz(req.params.id, req.body);
  res.json({ success: true, data: quiz });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await quizService.deleteQuiz(req.params.id);
  res.json({ success: true, data: { message: 'Quiz deleted' } });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const quiz = await quizService.getQuizById(req.params.id);
  res.json({ success: true, data: quiz });
});

export const list = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const filter: Record<string, unknown> = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.subject) filter.subject = req.query.subject;
  if (req.query.difficulty) filter.difficulty = req.query.difficulty;
  const result = await quizService.listQuizzes(filter, page, limit);
  res.json({ success: true, data: result.quizzes, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
});

export const listAll = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const filter: Record<string, unknown> = {};
  if (req.query.type) filter.type = req.query.type;
  if (req.query.category) filter.category = req.query.category;
  const result = await quizService.listAllQuizzes(filter, page, limit);
  res.json({ success: true, data: result.quizzes, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
});

export const startAttempt = asyncHandler(async (req: Request, res: Response) => {
  const result = await quizService.startAttempt(req.user!.userId, req.params.quizId);
  const quizObj = result.quiz.toObject();
  const sanitizedQuestions = quizObj.questions.map((q) => ({
    questionText: q.questionText,
    options: q.options,
    marks: q.marks,
    difficulty: q.difficulty,
  }));
  quizObj.questions = sanitizedQuestions as typeof quizObj.questions;
  res.json({ success: true, data: { quiz: quizObj, startedAt: result.startedAt } });
});

export const submitAttempt = asyncHandler(async (req: Request, res: Response) => {
  const { answers, timeTaken } = req.body;
  const attempt = await quizService.submitAttempt(req.user!.userId, req.params.quizId, answers, timeTaken);
  await activityService.logActivity(req.user!.userId, 'quiz_submitted', { quizId: req.params.quizId, score: attempt.percentage });
  await readinessService.calculateReadiness(req.user!.userId);
  res.status(201).json({ success: true, data: attempt });
});

export const getAttempts = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await quizService.getAttemptsByUser(req.user!.userId, page, limit);
  res.json({ success: true, data: result.attempts, meta: { page: result.page, limit: result.limit, total: result.total, totalPages: result.totalPages } });
});

export const getAttemptById = asyncHandler(async (req: Request, res: Response) => {
  const attempt = await quizService.getAttemptById(req.params.id);
  res.json({ success: true, data: attempt });
});

export const getPerformance = asyncHandler(async (req: Request, res: Response) => {
  const analytics = await quizService.getPerformanceAnalytics(req.user!.userId);
  res.json({ success: true, data: analytics });
});
