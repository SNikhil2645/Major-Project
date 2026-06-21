import mongoose, { Schema, Document } from 'mongoose';

export interface IReadinessScoreDocument extends Document {
  userId: mongoose.Types.ObjectId;
  overall: number;
  aptitude: { score: number; weight: number };
  technical: { score: number; weight: number };
  resume: { score: number; weight: number };
  coding: { score: number; weight: number };
  lastUpdated: Date;
}

const readinessScoreSchema = new Schema<IReadinessScoreDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    overall: { type: Number, default: 0 },
    aptitude: {
      score: { type: Number, default: 0 },
      weight: { type: Number, default: 30 },
    },
    technical: {
      score: { type: Number, default: 0 },
      weight: { type: Number, default: 25 },
    },
    resume: {
      score: { type: Number, default: 0 },
      weight: { type: Number, default: 20 },
    },
    coding: {
      score: { type: Number, default: 0 },
      weight: { type: Number, default: 25 },
    },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export const ReadinessScore = mongoose.model<IReadinessScoreDocument>('ReadinessScore', readinessScoreSchema);
