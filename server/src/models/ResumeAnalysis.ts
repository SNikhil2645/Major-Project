import mongoose, { Schema, Document } from 'mongoose';

export interface IResumeAnalysisDocument extends Document {
  userId: mongoose.Types.ObjectId;
  fileName: string;
  fileUrl: string;
  extractedText: string;
  score: number;
  missingSections: string[];
  suggestions: string[];
  keywordsFound: string[];
  keywordsMissing: string[];
  analyzedAt: Date;
}

const resumeAnalysisSchema = new Schema<IResumeAnalysisDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    extractedText: { type: String },
    score: { type: Number, default: 0 },
    missingSections: [{ type: String }],
    suggestions: [{ type: String }],
    keywordsFound: [{ type: String }],
    keywordsMissing: [{ type: String }],
    analyzedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

resumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

export const ResumeAnalysis = mongoose.model<IResumeAnalysisDocument>('ResumeAnalysis', resumeAnalysisSchema);
