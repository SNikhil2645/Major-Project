export interface IResumeAnalysis {
  _id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  extractedText: string;
  score: number;
  missingSections: string[];
  suggestions: string[];
  keywordsFound: string[];
  keywordsMissing: string[];
  analyzedAt: string;
  createdAt: string;
}
