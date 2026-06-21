import { z } from 'zod';

export const questionSchema = z.object({
  questionText: z.string().min(1),
  options: z.array(z.string()).min(2).max(6),
  correctAnswer: z.number().int().min(0),
  explanation: z.string().optional(),
  marks: z.number().int().positive().default(1),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
});

export const createQuizSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().optional(),
  type: z.enum(['aptitude', 'technical']),
  category: z.string().optional(),
  subject: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).default('medium'),
  questions: z.array(questionSchema).min(1),
  timeLimit: z.number().int().positive().default(30),
});

export const updateQuizSchema = createQuizSchema.partial();

export const submitAttemptSchema = z.object({
  answers: z.array(z.object({
    questionIndex: z.number().int().min(0),
    selectedAnswer: z.number().int().min(0),
  })),
  timeTaken: z.number().int().positive(),
});
