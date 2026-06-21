export interface ITestCase {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
}
export interface ICodingChallenge {
    _id: string;
    title: string;
    description: string;
    problemStatement: string;
    constraints?: string;
    sampleInput?: string;
    sampleOutput?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    tags: string[];
    testCases: ITestCase[];
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
export interface ICodingSubmission {
    _id: string;
    userId: string;
    challengeId: string;
    challengeTitle: string;
    code: string;
    language: string;
    status: 'pending' | 'correct' | 'incorrect';
    passedTestCases: number;
    totalTestCases: number;
    submittedAt: string;
}
//# sourceMappingURL=coding.d.ts.map