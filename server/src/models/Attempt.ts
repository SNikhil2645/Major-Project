import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswerEmbedded {
  questionIndex: number;
  selectedAnswer: number;
  isCorrect: boolean;
}

export interface IAttemptDocument extends Document {
  userId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  quizTitle: string;
  type: string;
  category?: string;
  subject?: string;
  answers: IAnswerEmbedded[];
  score: number;
  totalMarks: number;
  percentage: number;
  timeTaken: number;
  completedAt: Date;
}

const attemptSchema = new Schema<IAttemptDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
    quizTitle: { type: String, required: true },
    type: { type: String, enum: ['aptitude', 'technical'], required: true },
    category: String,
    subject: String,
    answers: [{
      questionIndex: { type: Number, required: true },
      selectedAnswer: { type: Number, required: true },
      isCorrect: { type: Boolean, required: true },
    }],
    score: { type: Number, required: true, default: 0 },
    totalMarks: { type: Number, required: true },
    percentage: { type: Number, required: true, default: 0 },
    timeTaken: { type: Number, required: true, default: 0 },
    completedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

attemptSchema.index({ userId: 1, createdAt: -1 });
attemptSchema.index({ quizId: 1 });

export const Attempt = mongoose.model<IAttemptDocument>('Attempt', attemptSchema);
