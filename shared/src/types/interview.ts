export type InterviewRole = 'software-developer' | 'cloud-support-engineer' | 'data-analyst' | 'full-stack-developer';

export interface IInterviewQuestion {
  question: string;
  answer?: string;
  evaluation?: {
    score: number;
    feedback: string;
    technicalAccuracy?: number;
    communication?: number;
  };
}

export interface IMockInterview {
  _id: string;
  userId: string;
  role: InterviewRole;
  questions: IInterviewQuestion[];
  status: 'in-progress' | 'completed';
  overallScore?: number;
  totalQuestions: number;
  currentQuestion: number;
  startedAt: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
