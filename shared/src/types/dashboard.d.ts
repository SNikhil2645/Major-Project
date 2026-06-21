export interface DashboardStats {
    quizzesAttempted: number;
    averageScore: number;
    codingSolved: number;
    resumeScore: number | null;
    readinessScore: number | null;
    recentActivity: {
        action: string;
        metadata?: Record<string, unknown>;
        createdAt: string;
    }[];
}
export interface AdminStats {
    totalUsers: number;
    totalQuizzes: number;
    totalCodingChallenges: number;
    totalResources: number;
    totalAttempts: number;
    recentRegistrations: number;
    averageQuizScore: number;
    topPerformers: {
        _id: string;
        name: string;
        email: string;
        averageScore: number;
    }[];
}
//# sourceMappingURL=dashboard.d.ts.map