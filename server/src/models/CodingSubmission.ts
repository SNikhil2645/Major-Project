import mongoose, { Schema, Document } from 'mongoose';

export interface ICodingSubmissionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  challengeId: mongoose.Types.ObjectId;
  challengeTitle: string;
  code: string;
  language: string;
  status: string;
  passedTestCases: number;
  totalTestCases: number;
  submittedAt: Date;
}

const codingSubmissionSchema = new Schema<ICodingSubmissionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    challengeId: { type: Schema.Types.ObjectId, ref: 'CodingChallenge', required: true },
    challengeTitle: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, default: 'javascript' },
    status: { type: String, enum: ['pending', 'correct', 'incorrect'], default: 'pending' },
    passedTestCases: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

codingSubmissionSchema.index({ userId: 1, challengeId: 1 });

export const CodingSubmission = mongoose.model<ICodingSubmissionDocument>('CodingSubmission', codingSubmissionSchema);
