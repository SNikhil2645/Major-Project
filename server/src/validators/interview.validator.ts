import { z } from 'zod';

export const startInterviewSchema = z.object({
  role: z.enum(['software-developer', 'cloud-support-engineer', 'data-analyst', 'full-stack-developer']),
  totalQuestions: z.number().int().min(3).max(10).default(5),
});

export const submitAnswerSchema = z.object({
  answer: z.string().min(1, 'Answer is required'),
});
