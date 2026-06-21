import { z } from 'zod';

export const testCaseSchema = z.object({
  input: z.string(),
  expectedOutput: z.string(),
  isHidden: z.boolean().default(false),
});

export const createChallengeSchema = z.object({
  title: z.string().min(2).max(200),
  description: z.string().min(1),
  problemStatement: z.string().min(1),
  constraints: z.string().optional(),
  sampleInput: z.string().optional(),
  sampleOutput: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  tags: z.array(z.string()).default([]),
  testCases: z.array(testCaseSchema).min(1),
});

export const updateChallengeSchema = createChallengeSchema.partial();

export const submitSolutionSchema = z.object({
  code: z.string().min(1),
  language: z.string().default('javascript'),
});
