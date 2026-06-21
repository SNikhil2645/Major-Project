import mongoose, { Schema, Document } from 'mongoose';

export interface IEvaluationEmbedded {
  score: number;
  feedback: string;
  technicalAccuracy?: number;
  communication?: number;
}

export interface IInterviewQuestionEmbedded {
  question: string;
  answer?: string;
  evaluation?: IEvaluationEmbedded;
}

export interface IMockInterviewDocument extends Document {
  userId: mongoose.Types.ObjectId;
  role: string;
  questions: IInterviewQuestionEmbedded[];
  status: string;
  overallScore?: number;
  totalQuestions: number;
  currentQuestion: number;
  startedAt: Date;
  completedAt?: Date;
}

const evaluationSchema = new Schema<IEvaluationEmbedded>({
  score: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  technicalAccuracy: { type: Number },
  communication: { type: Number },
}, { _id: false });

const questionSchema = new Schema<IInterviewQuestionEmbedded>({
  question: { type: String, required: true },
  answer: String,
  evaluation: { type: evaluationSchema, default: () => ({}) },
}, { _id: false });

const mockInterviewSchema = new Schema<IMockInterviewDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    questions: [questionSchema],
    status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
    overallScore: Number,
    totalQuestions: { type: Number, default: 5 },
    currentQuestion: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: Date,
  },
  { timestamps: true },
);

mockInterviewSchema.index({ userId: 1, createdAt: -1 });

export const MockInterview = mongoose.model<IMockInterviewDocument>('MockInterview', mockInterviewSchema);
