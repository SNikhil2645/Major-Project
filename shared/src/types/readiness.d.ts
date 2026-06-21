export interface IReadinessScore {
    _id: string;
    userId: string;
    overall: number;
    aptitude: {
        score: number;
        weight: number;
    };
    technical: {
        score: number;
        weight: number;
    };
    resume: {
        score: number;
        weight: number;
    };
    coding: {
        score: number;
        weight: number;
    };
    lastUpdated: string;
    createdAt: string;
    updatedAt: string;
}
//# sourceMappingURL=readiness.d.ts.map