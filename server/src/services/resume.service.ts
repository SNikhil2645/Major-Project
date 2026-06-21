import { ResumeAnalysis } from '../models/ResumeAnalysis';

const REQUIRED_SECTIONS = ['education', 'experience', 'projects', 'skills'];
const TECH_KEYWORDS = [
  'github', 'linkedin', 'python', 'java', 'javascript', 'react', 'node', 'mongodb',
  'sql', 'aws', 'docker', 'git', 'api', 'machine learning', 'data structure', 'algorithm',
];
const QUANTIFIED_PATTERN = /\d+\s*(%|years?|months?|projects?|users?|clients?|revenue|growth)/i;

export async function analyzeResume(
  userId: string,
  fileName: string,
  fileUrl: string,
  extractedText: string,
) {
  const text = extractedText.toLowerCase();

  const missingSections: string[] = [];
  for (const section of REQUIRED_SECTIONS) {
    if (!text.includes(section)) {
      missingSections.push(section.charAt(0).toUpperCase() + section.slice(1));
    }
  }

  const keywordsFound: string[] = [];
  const keywordsMissing: string[] = [];
  for (const kw of TECH_KEYWORDS) {
    if (text.includes(kw)) {
      keywordsFound.push(kw);
    } else {
      keywordsMissing.push(kw);
    }
  }

  const suggestions: string[] = [];
  let score = 40;

  if (missingSections.length === 0) {
    score += 20;
  } else {
    suggestions.push(`Add missing sections: ${missingSections.join(', ')}`);
  }

  const hasQuantified = QUANTIFIED_PATTERN.test(text);
  if (hasQuantified) {
    score += 10;
  } else {
    suggestions.push('Add quantifiable achievements (e.g., "improved performance by 30%")');
  }

  const keywordScore = Math.min(Math.round((keywordsFound.length / TECH_KEYWORDS.length) * 20), 20);
  score += keywordScore;

  if (keywordsFound.length < 5) {
    suggestions.push('Include more technical keywords relevant to your target role');
  }

  const wordCount = extractedText.split(/\s+/).length;
  if (wordCount < 200) {
    suggestions.push('Consider adding more content to your resume (aim for 300-500 words)');
    score -= 5;
  } else if (wordCount > 800) {
    suggestions.push('Consider trimming your resume to be more concise');
    score -= 5;
  } else {
    score += 5;
  }

  if (text.includes('linkedin')) {
    score += 3;
  } else {
    suggestions.push('Add your LinkedIn profile link');
  }
  if (text.includes('github')) {
    score += 2;
  } else {
    suggestions.push('Add your GitHub profile link');
  }

  score = Math.max(0, Math.min(100, score));

  const analysis = await ResumeAnalysis.create({
    userId,
    fileName,
    fileUrl,
    extractedText,
    score,
    missingSections,
    suggestions,
    keywordsFound,
    keywordsMissing,
  });

  return analysis;
}

export async function getResumeAnalysesByUser(userId: string) {
  return ResumeAnalysis.find({ userId }).sort({ createdAt: -1 }).lean();
}

export async function getLatestResumeAnalysis(userId: string) {
  return ResumeAnalysis.findOne({ userId }).sort({ createdAt: -1 }).lean();
}
