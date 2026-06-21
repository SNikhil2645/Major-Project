export const ROLES = {
  STUDENT: 'student',
  ADMIN: 'admin',
} as const;

export const QUIZ_CATEGORIES = [
  'quantitative-aptitude',
  'logical-reasoning',
  'verbal-ability',
  'data-interpretation',
] as const;

export const TECHNICAL_SUBJECTS = [
  'c',
  'java',
  'python',
  'dbms',
  'computer-networks',
  'operating-systems',
  'sql',
  'cloud-computing',
] as const;

export const CODING_DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export const INTERVIEW_ROLES = [
  'software-developer',
  'cloud-support-engineer',
  'data-analyst',
  'full-stack-developer',
] as const;

export const ACTIVITY_ACTIONS = {
  QUIZ_SUBMITTED: 'quiz_submitted',
  RESUME_UPLOADED: 'resume_uploaded',
  RESUME_ANALYZED: 'resume_analyzed',
  CODING_SUBMITTED: 'coding_submitted',
  INTERVIEW_COMPLETED: 'interview_completed',
  PROFILE_UPDATED: 'profile_updated',
} as const;
