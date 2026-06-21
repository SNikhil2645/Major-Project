import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionEmbedded {
  questionText: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  marks: number;
  difficulty: string;
}

export interface IQuizDocument extends Document {
  title: string;
  description?: string;
  type: 'aptitude' | 'technical';
  category?: string;
  subject?: string;
  difficulty: string;
  questions: IQuestionEmbedded[];
  timeLimit: number;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const questionSchema = new Schema<IQuestionEmbedded>({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true },
  explanation: String,
  marks: { type: Number, required: true, default: 1 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
});

const quizSchema = new Schema<IQuizDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    type: { type: String, enum: ['aptitude', 'technical'], required: true },
    category: { type: String },
    subject: { type: String },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
    questions: [questionSchema],
    timeLimit: { type: Number, required: true, default: 30 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

quizSchema.index({ type: 1, category: 1 });
quizSchema.index({ type: 1, subject: 1 });
quizSchema.index({ isActive: 1 });

export const Quiz = mongoose.model<IQuizDocument>('Quiz', quizSchema);
