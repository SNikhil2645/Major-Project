import mongoose, { Schema, Document } from 'mongoose';

export interface IActivityLogDocument extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  metadata?: Record<string, unknown>;
}

const activityLogSchema = new Schema<IActivityLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true },
);

activityLogSchema.index({ userId: 1, createdAt: -1 });

export const ActivityLog = mongoose.model<IActivityLogDocument>('ActivityLog', activityLogSchema);
