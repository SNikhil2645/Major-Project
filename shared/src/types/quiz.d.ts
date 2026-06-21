export type QuizCategory = 'quantitative-aptitude' | 'logical-reasoning' | 'verbal-ability' | 'data-interpretation';
export type TechnicalSubject = 'c' | 'java' | 'python' | 'dbms' | 'computer-networks' | 'operating-systems' | 'sql' | 'cloud-computing';
export type QuizType = 'aptitude' | 'technical';
export type Difficulty = 'easy' | 'medium' | 'hard';
export interface Question {
    questionText: string;
    options: string[];
    correctAnswer: number;
    explanation?: string;
    marks: number;
    difficulty: Difficulty;
}
export interface IQuiz {
    _id: string;
    title: string;
    description?: string;
    type: QuizType;
    category?: QuizCategory;
    subject?: TechnicalSubject;
    difficulty: Difficulty;
    questions: Question[];
    timeLimit: number;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
export interface IAttempt {
    _id: string;
    userId: string;
    quizId: string;
    quizTitle: string;
    type: QuizType;
    category?: string;
    subject?: string;
    answers: {
        questionIndex: number;
        selectedAnswer: number;
        isCorrect: boolean;
    }[];
    score: number;
    totalMarks: number;
    percentage: number;
    timeTaken: number;
    completedAt: string;
    createdAt: string;
}
//# sourceMappingURL=quiz.d.ts.map