import mongoose, { Schema, Document } from 'mongoose';

export interface ITestCaseEmbedded {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface ICodingChallengeDocument extends Document {
  title: string;
  description: string;
  problemStatement: string;
  constraints?: string;
  sampleInput?: string;
  sampleOutput?: string;
  difficulty: string;
  tags: string[];
  testCases: ITestCaseEmbedded[];
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const testCaseSchema = new Schema<ITestCaseEmbedded>({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
});

const codingChallengeSchema = new Schema<ICodingChallengeDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    problemStatement: { type: String, required: true },
    constraints: String,
    sampleInput: String,
    sampleOutput: String,
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    tags: [{ type: String }],
    testCases: [testCaseSchema],
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

codingChallengeSchema.index({ difficulty: 1, tags: 1 });

export const CodingChallenge = mongoose.model<ICodingChallengeDocument>('CodingChallenge', codingChallengeSchema);
