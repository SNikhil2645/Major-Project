import { ActivityLog } from '../models/ActivityLog';

export async function logActivity(userId: string, action: string, metadata?: Record<string, unknown>) {
  await ActivityLog.create({ userId, action, metadata });
}

export async function getRecentActivity(userId: string, limit: number = 5) {
  return ActivityLog.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}
